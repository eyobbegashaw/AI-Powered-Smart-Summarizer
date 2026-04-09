import google.genai as genai
import json
import hashlib
from typing import Dict, List, Optional
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.redis_client import redis_client


class AmharicSummarizer:
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured")
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        # Try different Gemini models in order of preference
        # amharic_summarizer.py ውስጥ
        self.model_names = [
            'models/gemini-2.0-flash',       # በጣም ፈጣን እና አዲስ
            'models/gemini-2.5-flash',       # ይበልጥ ጎበዝ
            'models/gemini-flash-latest'      # ሁሌም የቅርብ ጊዜው
        ]
        self.model = self._get_working_model()
        self.model_fast = self._get_working_model()
    
    def _get_working_model(self):
        """Try to find a working Gemini model"""
        # Check google.genai version
        try:
            import google.genai
            version = getattr(google.genai, '__version__', 'unknown')
            logger.info(f"Using google.genai version: {version}")
        except ImportError:
            logger.error("google.genai not properly installed")
            raise ValueError("google.genai not properly installed")
        
        # Return model name directly - models are created dynamically in generation calls
        # _get_working_model ውስጥ
        for model_name in self.model_names:
            try:
                # በዝርዝሩ ያገኘኸውን ስም በቀጥታ መጠቀም
                test_response = self.client.models.generate_content(
                    model=model_name,
                    contents="ሰላም"
                )
                logger.info(f"Successfully validated Gemini model: {model_name}")
                return model_name
            except Exception as e:
                logger.warning(f"Failed to validate model {model_name}: {str(e)}")
                continue
        # If no models work, enable mock mode for development
        logger.warning("No working Gemini models found, enabling mock mode for development")
        return "mock"
    
    @retry(stop=stop_after_attempt(10), wait=wait_exponential(multiplier=3, min=10, max=60), retry_error_callback=lambda retry_state: {"error": "Rate limit exceeded. Please try again later."})
    async def summarize(self, text: str, summary_type: str = 'paragraph',
                       length: str = 'medium', user_id: Optional[int] = None) -> Dict:
        """Generate summary with caching"""
        
        cache_key = self._get_cache_key(text, summary_type, length)
        cached_result = await redis_client.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for document")
            return json.loads(cached_result)
        
        language_info = await self._detect_language_advanced(text)
        
        try:
            if language_info['is_bilingual']:
                summary = await self._summarize_bilingual(text, summary_type, length)
            elif language_info['primary_language'] == 'am':
                summary = await self._summarize_amharic(text, summary_type, length)
            else:
                summary = await self._summarize_english(text, summary_type, length)
            
            keywords = await self._extract_keywords(text, language_info['primary_language'])
            
            summary_am = None
            if language_info['primary_language'] == 'en' and language_info['has_amharic']:
                summary_am = await self._translate_summary(summary, 'am')
            
            result = {
                'summary': summary,
                'summary_am': summary_am,
                'keywords': keywords,
                'language': language_info['primary_language'],
                'is_bilingual': language_info['is_bilingual'],
                'word_count': len(text.split()),
                'summary_word_count': len(summary.split())
            }
            
            await redis_client.setex(cache_key, 86400, json.dumps(result))
            return result
            
        except Exception as e:
            logger.error(f"Summarization failed: {str(e)}")
            raise
    
    async def _summarize_amharic(self, text: str, summary_type: str, length: str) -> str:
        """Amharic-specific summarization"""
        
        # Mock mode fallback
        if self.model == "mock":
            logger.info("Using mock mode for Amharic summarization")
            return "This is a mock Amharic summary for development purposes. The actual Gemini API is rate limited."
        
        length_config = {
            'short': {'max_tokens': 200, 'instruction': '3-4 sentences'},
            'medium': {'max_tokens': 500, 'instruction': 'one paragraph'},
            'long': {'max_tokens': 1000, 'instruction': '3-4 paragraphs'}
        }
        
        type_instructions = {
            'bullets': 'bullet points',
            'paragraph': 'continuous paragraph',
            'section': 'section-based organization'
        }
        
        system_prompt = """You are an expert Amharic language summarizer. Create clear, concise, and informative summaries that preserve key information."""
        
        user_prompt = f"""Summarize the following Amharic text:
        
{text[:4000]}

Instructions: {length_config[length]['instruction']}
Format: {type_instructions[summary_type]}

Summary:"""
        
        prompt = system_prompt + "\n\n" + user_prompt
        
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                max_output_tokens=length_config[length]['max_tokens'],
                temperature=0.3,
            )
        )
        
        return response.text
    
    async def _summarize_english(self, text: str, summary_type: str, length: str) -> str:
        """English summarization"""
        
        # Mock mode fallback
        if self.model_fast == "mock":
            logger.info("Using mock mode for English summarization")
            return "This is a mock English summary for development purposes. The actual Gemini API is rate limited."
        
        length_config = {
            'short': 200,
            'medium': 500,
            'long': 1000
        }
        
        type_format = {
            'bullets': 'bullet points',
            'paragraph': 'single continuous paragraph',
            'section': 'section-based organization'
        }
        
        prompt = f"""You are an expert summarizer. Create clear, concise, and informative summaries.

Summarize this text in {type_format[summary_type]} format, approximately {length_config[length]} words:

{text[:4000]}"""
        
        response = self.client.models.generate_content(
            model=self.model_fast,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                max_output_tokens=length_config[length],
                temperature=0.3,
            )
        )
        
        return response.text
    
    async def _summarize_bilingual(self, text: str, summary_type: str, length: str) -> str:
        """Handle documents mixing Amharic and English"""
        
        # Mock mode fallback
        if self.model == "mock":
            logger.info("Using mock mode for bilingual summarization")
            return "This is a mock bilingual summary for development purposes. The actual Gemini API is rate limited."
        
        length_config = {'short': 200, 'medium': 500, 'long': 1000}
        
        prompt = f"""You are an expert bilingual summarizer for Amharic and English documents. Create summaries that preserve key information from both languages.

Summarize this bilingual (Amharic/English) document. Summary type: {summary_type}. Length: {length}:

{text[:4000]}"""
        
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                max_output_tokens=length_config[length],
                temperature=0.3,
            )
        )
        
        return response.text
    
    async def _extract_keywords(self, text: str, language: str) -> List[str]:
        """Extract keywords"""
        
        # Mock mode fallback
        if self.model_fast == "mock":
            logger.info("Using mock mode for keyword extraction")
            return ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
        
        prompt = f"""Extract the 10 most important keywords or key phrases from the following text. Return as comma-separated list:

{text[:2000]}"""
        
        response = self.client.models.generate_content(
            model=self.model_fast,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                max_output_tokens=100,
                temperature=0.2,
            )
        )
        
        keywords = response.text.split(',')
        return [k.strip() for k in keywords if k.strip()][:10]
    
    async def _translate_summary(self, text: str, target_language: str) -> str:
        """Translate summary to target language"""
        
        # Mock mode fallback
        if self.model_fast == "mock":
            logger.info("Using mock mode for translation")
            return f"This is a mock translation to {target_language} for development purposes. The actual Gemini API is rate limited."
        
        language_names = {'am': 'Amharic', 'en': 'English'}
        
        prompt = f"""You are a professional translator. Translate the following text to {language_names[target_language]} accurately:

{text}"""
        
        response = self.client.models.generate_content(
            model=self.model_fast,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                max_output_tokens=500,
                temperature=0.2,
            )
        )
        
        return response.text
    
    async def _detect_language_advanced(self, text: str) -> Dict:
        """Advanced language detection for Amharic/English"""
        
        amharic_range = range(0x1200, 0x137F + 1)
        amharic_chars = sum(1 for c in text if ord(c) in amharic_range)
        total_chars = len(text.strip())
        
        amharic_ratio = amharic_chars / total_chars if total_chars > 0 else 0
        english_words = len([w for w in text.split() if w.isalpha() and any(c.isascii() for c in w)])
        total_words = len(text.split())
        english_ratio = english_words / total_words if total_words > 0 else 0
        
        is_bilingual = 0.2 < amharic_ratio < 0.8 and english_ratio > 0.2
        
        if amharic_ratio > 0.3:
            primary_language = 'am'
        else:
            primary_language = 'en'
        
        return {
            'primary_language': primary_language,
            'is_bilingual': is_bilingual,
            'has_amharic': amharic_ratio > 0.05
        }
    
    def _get_cache_key(self, text: str, summary_type: str, length: str) -> str:
        """Generate cache key"""
        text_hash = hashlib.blake2b(text.encode(), digest_size=16).hexdigest()
        return f"summary:{text_hash}:{summary_type}:{length}"

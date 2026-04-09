import openai
from typing import List, Dict, Set
from collections import Counter
import re
from loguru import logger
from app.core.config import settings


class KeywordExtractor:
    def __init__(self):
        self.client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.amharic_stopwords = self._load_amharic_stopwords()
    
    def _load_amharic_stopwords(self) -> Set[str]:
        """Load Amharic stopwords"""
        return {
            'እንደ', 'በ', 'ላይ', 'ሆነ', 'ሆነው', 'ከ', 'ወደ', 'ሲሆን',
            'ተብሎ', 'ሲል', 'አለ', 'አላቸው', 'እንዲሁም', 'ማለት',
            'ነው', 'በመሆኑ', 'ስለ', 'እንደሆነ', 'ሲሆን', 'ነበር', 'ሊሆን'
        }
    
    async def extract_keywords(self, text: str, language: str = 'en', method: str = 'hybrid') -> List[str]:
        """Extract keywords using hybrid approach"""
        
        if method == 'ai':
            return await self._extract_with_ai(text, language)
        elif method == 'nlp':
            return self._extract_with_nlp(text, language)
        else:
            return await self._extract_hybrid(text, language)
    
    def _extract_with_nlp(self, text: str, language: str) -> List[str]:
        """Extract keywords using NLP techniques"""
        
        if language == 'am':
            return self._extract_amharic_keywords_nlp(text)
        else:
            return self._extract_english_keywords_nlp(text)
    
    def _extract_english_keywords_nlp(self, text: str) -> List[str]:
        """English keyword extraction"""
        
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        stopwords = {'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'are', 'was', 'were', 'been', 'will', 'can', 'could', 'should', 'would', 'may', 'might', 'also', 'such', 'these', 'those', 'some', 'many', 'more', 'most', 'other', 'another', 'between', 'through', 'during', 'without', 'within', 'along', 'following', 'including', 'according', 'based', 'using', 'used', 'use', 'using', 'provides', 'providing', 'provides'}
        
        filtered_words = [w for w in words if w not in stopwords and len(w) > 2]
        freq_dist = Counter(filtered_words)
        
        return [word for word, _ in freq_dist.most_common(10)]
    
    def _extract_amharic_keywords_nlp(self, text: str) -> List[str]:
        """Amharic keyword extraction"""
        
        words = text.split()
        filtered_words = [
            word for word in words 
            if word not in self.amharic_stopwords 
            and len(word) > 1
            and not word.isdigit()
        ]
        
        freq_dist = Counter(filtered_words)
        return [word for word, _ in freq_dist.most_common(10)]
    
    async def _extract_with_ai(self, text: str, language: str) -> List[str]:
        """Extract keywords using GPT"""
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Extract the 10 most important keywords or key phrases. Return as comma-separated list."},
                    {"role": "user", "content": f"Extract keywords from:\n\n{text[:3000]}"}
                ],
                temperature=0.2,
                max_tokens=150
            )
            
            keywords = response.choices[0].message.content.split(',')
            return [k.strip() for k in keywords if k.strip()][:10]
            
        except Exception as e:
            logger.error(f"AI keyword extraction failed: {e}")
            return self._extract_with_nlp(text, language)
    
    async def _extract_hybrid(self, text: str, language: str) -> List[str]:
        """Combine NLP and AI for better results"""
        
        nlp_keywords = self._extract_with_nlp(text, language)
        
        if len(nlp_keywords) >= 10:
            return nlp_keywords[:10]
        
        ai_keywords = await self._extract_with_ai(text, language)
        combined = list(dict.fromkeys(nlp_keywords + ai_keywords))
        
        return combined[:10]
    
    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract named entities"""
        
        entities = {
            'persons': [],
            'organizations': [],
            'locations': [],
            'dates': []
        }
        
        person_pattern = r'\b(?:Mr\.|Ms\.|Dr\.|Prof\.)\s+[A-Z][a-z]+\b|\b[A-Z][a-z]+\s+[A-Z][a-z]+\b'
        entities['persons'] = re.findall(person_pattern, text)[:5]
        
        org_pattern = r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Inc\.|Corp\.|LLC|Ltd\.|PLC)\b'
        entities['organizations'] = re.findall(org_pattern, text)[:5]
        
        loc_pattern = r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:City|Town|Country|Region|State)\b'
        entities['locations'] = re.findall(loc_pattern, text)[:5]
        
        date_pattern = r'\b\d{1,2}/\d{1,2}/\d{4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b'
        entities['dates'] = re.findall(date_pattern, text)[:5]
        
        return entities
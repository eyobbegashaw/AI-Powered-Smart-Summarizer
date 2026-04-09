import openai
from typing import Dict, Optional, List
from tenacity import retry, stop_after_attempt, wait_exponential
from loguru import logger
from app.core.config import settings

class EnglishSummarizer:
    def __init__(self):
        self.client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def summarize(
        self,
        text: str,
        summary_type: str = 'paragraph',
        length: str = 'medium',
        focus_areas: Optional[list] = None
    ) -> Dict:
        """Generate English summary with various options"""
        
        length_config = {
            'short': {'max_tokens': 200, 'description': 'very concise, 3-4 sentences'},
            'medium': {'max_tokens': 500, 'description': 'balanced, 1-2 paragraphs'},
            'long': {'max_tokens': 1000, 'description': 'detailed, 3-4 paragraphs'}
        }
        
        type_formats = {
            'bullets': 'bullet points with key takeaways',
            'paragraph': 'a single coherent paragraph',
            'section': 'section-based summary following the original structure'
        }
        
        prompt = f"""Please provide a {length_config[length]['description']} summary in {type_formats[summary_type]} format.

Original text:
{text[:4000]}

"""
        
        if focus_areas:
            prompt += f"\nFocus particularly on these areas: {', '.join(focus_areas)}\n"
        
        prompt += "\nSummary:"
        
        try:
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL_FAST if length == 'short' else settings.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert summarizer. Create clear, accurate, and well-structured summaries."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=length_config[length]['max_tokens']
            )
            
            summary_text = response.choices[0].message.content
            
            if summary_type == 'bullets':
                summary_text = self._format_bullet_points(summary_text)
            
            original_words = len(text.split())
            summary_words = len(summary_text.split())
            compression_ratio = summary_words / original_words if original_words > 0 else 0
            
            return {
                'summary': summary_text,
                'word_count': summary_words,
                'compression_ratio': compression_ratio,
                'model_used': settings.OPENAI_MODEL_FAST if length == 'short' else settings.OPENAI_MODEL
            }
            
        except Exception as e:
            logger.error(f"English summarization failed: {e}")
            raise
    
    def _format_bullet_points(self, text: str) -> str:
        """Ensure bullet points are properly formatted"""
        
        lines = text.split('\n')
        formatted_lines = []
        
        for line in lines:
            line = line.strip()
            if line:
                if not line.startswith(('-', '•', '*', '✓')):
                    formatted_lines.append(f"• {line}")
                else:
                    formatted_lines.append(line)
        
        return '\n'.join(formatted_lines)
    
    async def summarize_section_by_section(self, text: str, length: str = 'medium') -> Dict:
        """Summarize by detecting and summarizing each section"""
        
        sections = self._detect_sections(text)
        
        summaries = []
        for section in sections:
            summary = await self.summarize(
                section['text'],
                summary_type='paragraph',
                length='short' if length == 'short' else 'medium'
            )
            summaries.append({
                'heading': section['heading'],
                'summary': summary['summary']
            })
        
        return {
            'section_summaries': summaries,
            'total_sections': len(sections)
        }
    
    def _detect_sections(self, text: str) -> list:
        """Detect sections based on common patterns"""
        
        sections = []
        lines = text.split('\n')
        
        current_section = {'heading': 'Introduction', 'text': []}
        
        for line in lines:
            if (len(line.strip()) < 100 and 
                (line.isupper() or line.endswith(':') or 
                 line.startswith(('#', '##', '###')) or
                 line.strip().istitle())):
                
                if current_section['text']:
                    sections.append({
                        'heading': current_section['heading'],
                        'text': '\n'.join(current_section['text'])
                    })
                
                current_section = {
                    'heading': line.strip('#: '),
                    'text': []
                }
            else:
                current_section['text'].append(line)
        
        if current_section['text']:
            sections.append({
                'heading': current_section['heading'],
                'text': '\n'.join(current_section['text'])
            })
        
        return sections if sections else [{'heading': 'Content', 'text': text}]
    
    async def extract_key_sentences(self, text: str, num_sentences: int = 5) -> list:
        """Extract the most important sentences from the text"""
        
        response = await self.client.chat.completions.create(
            model=settings.OPENAI_MODEL_FAST,
            messages=[
                {"role": "system", "content": "Extract the most important sentences that capture the main ideas."},
                {"role": "user", "content": f"Extract the top {num_sentences} key sentences from this text:\n\n{text[:3000]}"}
            ],
            temperature=0.2,
            max_tokens=300
        )
        
        sentences = response.choices[0].message.content.split('\n')
        return [s.strip() for s in sentences if s.strip()][:num_sentences]
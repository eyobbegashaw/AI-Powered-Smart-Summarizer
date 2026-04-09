import re
from typing import Dict, List, Tuple
from collections import Counter

class BilingualDetector:
    def __init__(self):
        # Unicode ranges
        self.ETHIOPIC_RANGE = range(0x1200, 0x137F + 1)
        self.LATIN_RANGE = range(0x0041, 0x007A + 1)
        
        # Common bilingual patterns
        self.bilingual_patterns = [
            r'[\u1200-\u137F]+\s+[a-zA-Z]+',
            r'[a-zA-Z]+\s+[\u1200-\u137F]+',
            r'[\u1200-\u137F]+[^a-zA-Z]*[a-zA-Z]+',
        ]
    
    def detect(self, text: str) -> Dict:
        """Detect if text is bilingual and provide statistics"""
        
        amharic_count = 0
        english_count = 0
        other_count = 0
        
        for char in text:
            code = ord(char)
            if code in self.ETHIOPIC_RANGE:
                amharic_count += 1
            elif (0x0041 <= code <= 0x005A) or (0x0061 <= code <= 0x007A):
                english_count += 1
            else:
                other_count += 1
        
        total = amharic_count + english_count + other_count
        
        amharic_ratio = amharic_count / total if total > 0 else 0
        english_ratio = english_count / total if total > 0 else 0
        
        sections = self._detect_bilingual_sections(text)
        switches = self._count_language_switches(text)
        
        if amharic_ratio > english_ratio:
            primary_language = 'am'
            secondary_language = 'en'
        else:
            primary_language = 'en'
            secondary_language = 'am'
        
        is_bilingual = (
            amharic_ratio > 0.1 and english_ratio > 0.1
            and (amharic_ratio < 0.9 and english_ratio < 0.9)
        ) or len(sections) > 1
        
        return {
            'is_bilingual': is_bilingual,
            'primary_language': primary_language,
            'secondary_language': secondary_language,
            'amharic_ratio': amharic_ratio,
            'english_ratio': english_ratio,
            'language_switches': switches,
            'bilingual_sections': sections,
            'mixed_words': self._find_mixed_words(text)
        }
    
    def _detect_bilingual_sections(self, text: str) -> List[Dict]:
        """Detect sections that are predominantly in one language"""
        
        sections = []
        current_section = {'start': 0, 'text': '', 'language': None}
        paragraphs = text.split('\n\n')
        
        for para in paragraphs:
            if not para.strip():
                continue
            
            amharic_chars = sum(1 for c in para if ord(c) in self.ETHIOPIC_RANGE)
            english_chars = sum(1 for c in para if (0x0041 <= ord(c) <= 0x005A) or (0x0061 <= ord(c) <= 0x007A))
            total = amharic_chars + english_chars
            
            if total > 0:
                amharic_ratio = amharic_chars / total
                
                if amharic_ratio > 0.7:
                    lang = 'am'
                elif amharic_ratio < 0.3:
                    lang = 'en'
                else:
                    lang = 'mixed'
                
                if current_section['language'] != lang:
                    if current_section['text']:
                        sections.append({
                            'language': current_section['language'],
                            'text': current_section['text'][:200]
                        })
                    current_section = {'text': para, 'language': lang}
                else:
                    current_section['text'] += '\n\n' + para
        
        if current_section['text']:
            sections.append({
                'language': current_section['language'],
                'text': current_section['text'][:200]
            })
        
        return sections
    
    def _count_language_switches(self, text: str) -> int:
        """Count number of times language switches within text"""
        
        switches = 0
        current_lang = None
        sentences = re.split(r'[.!?]+', text)
        
        for sentence in sentences:
            if not sentence.strip():
                continue
            
            amharic_chars = sum(1 for c in sentence if ord(c) in self.ETHIOPIC_RANGE)
            english_chars = sum(1 for c in sentence if (0x0041 <= ord(c) <= 0x005A) or (0x0061 <= ord(c) <= 0x007A))
            total = amharic_chars + english_chars
            
            if total > 0:
                amharic_ratio = amharic_chars / total
                
                if amharic_ratio > 0.6:
                    sentence_lang = 'am'
                elif amharic_ratio < 0.4:
                    sentence_lang = 'en'
                else:
                    continue
                
                if current_lang and current_lang != sentence_lang:
                    switches += 1
                
                current_lang = sentence_lang
        
        return switches
    
    def _find_mixed_words(self, text: str) -> List[str]:
        """Find words that contain both Amharic and English characters"""
        
        mixed_words = []
        words = text.split()
        
        for word in words:
            has_amharic = any(ord(c) in self.ETHIOPIC_RANGE for c in word)
            has_english = any((0x0041 <= ord(c) <= 0x005A) or (0x0061 <= ord(c) <= 0x007A) for c in word)
            
            if has_amharic and has_english:
                mixed_words.append(word)
        
        return list(set(mixed_words))[:10]
    
    def get_language_statistics(self, text: str) -> Dict:
        """Get detailed language statistics"""
        
        words = text.split()
        total_words = len(words)
        
        amharic_words = []
        english_words = []
        mixed_words = []
        
        for word in words:
            has_amharic = any(ord(c) in self.ETHIOPIC_RANGE for c in word)
            has_english = any((0x0041 <= ord(c) <= 0x005A) or (0x0061 <= ord(c) <= 0x007A) for c in word)
            
            if has_amharic and has_english:
                mixed_words.append(word)
            elif has_amharic:
                amharic_words.append(word)
            elif has_english:
                english_words.append(word)
        
        return {
            'total_words': total_words,
            'amharic_words': len(amharic_words),
            'english_words': len(english_words),
            'mixed_words': len(mixed_words),
            'amharic_percentage': (len(amharic_words) / total_words) * 100 if total_words > 0 else 0,
            'english_percentage': (len(english_words) / total_words) * 100 if total_words > 0 else 0,
            'mixed_percentage': (len(mixed_words) / total_words) * 100 if total_words > 0 else 0
        }
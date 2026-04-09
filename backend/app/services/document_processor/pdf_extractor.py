import io
import PyPDF2
from typing import Dict, List, Optional
import re
from loguru import logger


class PDFExtractor:
    def __init__(self):
        pass
    
    async def extract(self, file_bytes: bytes) -> Dict:
        """Extract text and metadata from PDF"""
        
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            
            metadata = {
                'title': pdf_reader.metadata.get('/Title') if pdf_reader.metadata else None,
                'author': pdf_reader.metadata.get('/Author') if pdf_reader.metadata else None,
                'subject': pdf_reader.metadata.get('/Subject') if pdf_reader.metadata else None,
                'page_count': len(pdf_reader.pages)
            }
            
            pages = []
            full_text = ""
            
            for page_num, page in enumerate(pdf_reader.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    pages.append({
                        'page': page_num,
                        'text': page_text
                    })
                    full_text += page_text + "\n\n"
            
            if not full_text.strip():
                return {
                    'text': '',
                    'metadata': metadata,
                    'pages': [],
                    'success': False,
                    'error': 'No text found - PDF may be scanned'
                }
            
            return {
                'text': self._clean_pdf_text(full_text),
                'metadata': metadata,
                'pages': pages,
                'page_count': len(pages),
                'success': True
            }
            
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            return {
                'text': '',
                'metadata': {},
                'pages': [],
                'success': False,
                'error': str(e)
            }
    
    def _clean_pdf_text(self, text: str) -> str:
        """Clean extracted PDF text"""
        
        text = re.sub(r'\f', '', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)
        
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            if not re.match(r'^\s*\d+\s*$', line):
                cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines).strip()
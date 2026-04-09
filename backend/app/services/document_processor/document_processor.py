import io
import PyPDF2
from docx import Document as DocxDocument
from bs4 import BeautifulSoup
import requests
from typing import Optional, Dict
from loguru import logger
import time
from newspaper import Article
import magic


class DocumentProcessor:
    def __init__(self):
        self.mime = magic.Magic(mime=True)
    
    async def process_file(self, file_bytes: bytes, filename: str) -> Dict:
        """Process uploaded file and extract text"""
        
        start_time = time.time()
        mime_type = self.mime.from_buffer(file_bytes[:1024])
        
        if filename.endswith('.pdf') or mime_type == 'application/pdf':
            text = await self._extract_pdf(file_bytes)
            file_type = 'pdf'
        elif filename.endswith('.docx') or mime_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            text = await self._extract_docx(file_bytes)
            file_type = 'docx'
        elif filename.endswith('.txt') or mime_type == 'text/plain':
            text = file_bytes.decode('utf-8', errors='ignore')
            file_type = 'txt'
        else:
            raise ValueError(f"Unsupported file type: {filename}")
        
        word_count = len(text.split())
        processing_time = time.time() - start_time
        
        return {
            'text': text,
            'word_count': word_count,
            'file_type': file_type,
            'mime_type': mime_type,
            'processing_time': processing_time
        }
    
    async def process_url(self, url: str) -> Dict:
        """Extract text from URL"""
        
        try:
            article = Article(url)
            article.download()
            article.parse()
            
            text = article.text
            title = article.title
            
            if not text or len(text.strip()) < 100:
                response = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                soup = BeautifulSoup(response.content, 'html.parser')
                
                for script in soup(["script", "style", "nav", "footer", "header"]):
                    script.decompose()
                
                text = soup.get_text()
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                text = ' '.join(chunk for chunk in chunks if chunk)
                title = soup.title.string if soup.title else "Untitled"
            
            return {
                'text': text,
                'title': title,
                'url': url,
                'word_count': len(text.split())
            }
            
        except Exception as e:
            logger.error(f"Failed to process URL {url}: {str(e)}")
            raise
    
    async def _extract_pdf(self, file_bytes: bytes) -> str:
        """Extract text from PDF"""
        
        text = ""
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        return text.strip()
    
    async def _extract_docx(self, file_bytes: bytes) -> str:
        """Extract text from DOCX"""
        
        doc = DocxDocument(io.BytesIO(file_bytes))
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()])
        return text.strip()
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import re
from loguru import logger
import aiohttp


class HtmlExtractor:
    def __init__(self):
        self.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    
    async def extract_from_url(self, url: str) -> Dict:
        """Extract content from HTML URL"""
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.user_agent}) as response:
                    html = await response.text()
                    return await self.extract_from_html(html, url)
        except Exception as e:
            logger.error(f"HTML extraction from URL failed: {e}")
            raise
    
    async def extract_from_html(self, html: str, base_url: Optional[str] = None) -> Dict:
        """Extract main content from HTML"""
        
        soup = BeautifulSoup(html, 'html.parser')
        
        for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
            element.decompose()
        
        metadata = {
            'title': self._extract_title(soup),
            'description': self._extract_meta(soup, 'description'),
            'keywords': self._extract_meta(soup, 'keywords'),
            'author': self._extract_meta(soup, 'author')
        }
        
        main_content = self._extract_main_content(soup)
        
        if not main_content:
            main_content = soup.get_text()
        
        text = self._clean_text(main_content)
        
        return {
            'text': text,
            'metadata': metadata,
            'text_length': len(text)
        }
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract page title"""
        
        if soup.title and soup.title.string:
            return soup.title.string.strip()
        
        og_title = self._extract_meta(soup, 'og:title')
        if og_title:
            return og_title
        
        h1 = soup.find('h1')
        if h1:
            return h1.get_text().strip()
        
        return "Untitled"
    
    def _extract_meta(self, soup: BeautifulSoup, name: str) -> Optional[str]:
        """Extract meta tag content"""
        
        meta = soup.find('meta', {'name': name})
        if meta and meta.get('content'):
            return meta.get('content').strip()
        
        meta = soup.find('meta', {'property': name})
        if meta and meta.get('content'):
            return meta.get('content').strip()
        
        return None
    
    def _extract_main_content(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract main content using common selectors"""
        
        selectors = [
            'main', 'article', '[role="main"]',
            '#main-content', '.main-content', '.content',
            '.post-content', '.article-content'
        ]
        
        for selector in selectors:
            content = soup.select_one(selector)
            if content:
                return content.get_text()
        
        body = soup.find('body')
        if body:
            return body.get_text()
        
        return None
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text"""
        
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'(?i)copyright\s+©?\s*\d{4}', '', text)
        text = re.sub(r'(?i)all rights reserved', '', text)
        text = re.sub(r'\.\s+', '.\n\n', text)
        
        return text.strip()
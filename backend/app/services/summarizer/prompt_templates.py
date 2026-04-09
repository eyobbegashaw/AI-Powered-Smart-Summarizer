class PromptTemplates:
    """Centralized prompt templates for summarization"""
    
    # Amharic prompts
    AMHARIC_SYSTEM = """አንተ የአማርኛ ቋንቋ ማጠቃለያ ባለሙያ ነህ። ዋና ዋና ነጥቦችን በማንሳት ግልጽና ትክክለኛ ማጠቃለያ አዘጋጅ።"""
    
    AMHARIC_BULLETS_TEMPLATE = """
    የሚከተለውን ጽሑፍ በነጥቦች መልክ አጠቃልል።
    
    ጽሑፉ:
    {text}
    
    ቁልፍ ነጥቦች:
    """
    
    AMHARIC_PARAGRAPH_TEMPLATE = """
    የሚከተለውን ጽሑፍ በአንድ ተከታታይ አንቀጽ አጠቃልል።
    
    ጽሑፉ:
    {text}
    
    ማጠቃለያ:
    """
    
    AMHARIC_SECTION_TEMPLATE = """
    የሚከተለውን ጽሑፍ በክፍሎች ተከፋፍለህ አጠቃልል።
    
    ጽሑፉ:
    {text}
    
    የክፍሎች ማጠቃለያ:
    """
    
    # English prompts
    ENGLISH_SYSTEM = """You are an expert summarizer. Create clear, accurate, and well-structured summaries."""
    
    ENGLISH_BULLETS_TEMPLATE = """
    Summarize the following text as bullet points with key takeaways:
    
    {text}
    
    Key points:
    """
    
    ENGLISH_PARAGRAPH_TEMPLATE = """
    Provide a concise paragraph summary of the following text:
    
    {text}
    
    Summary:
    """
    
    ENGLISH_SECTION_TEMPLATE = """
    Create a section-based summary of the following text, organizing by main topics:
    
    {text}
    
    Section-based summary:
    """
    
    # Bilingual prompts
    BILINGUAL_SYSTEM = """You are an expert bilingual summarizer for Amharic and English documents. Create summaries that preserve key information from both languages."""
    
    BILINGUAL_TEMPLATE = """
    Summarize this bilingual (Amharic/English) document:
    
    {text}
    
    Summary type: {summary_type}
    Length: {length}
    
    Provide a coherent summary that captures the main points from both languages:
    """
    
    # Keyword extraction
    KEYWORD_EXTRACTION_TEMPLATE = """
    Extract the {num_keywords} most important keywords or key phrases from the following text.
    Return them as a comma-separated list, sorted by importance.
    
    Text: {text}
    
    Keywords:
    """
    
    AMHARIC_KEYWORD_TEMPLATE = """
    ከሚከተለው ጽሑፍ {num_keywords} ቁልፍ ቃላትን አውጣ።
    በኮማ ተለያይተው ዝርዝር አድርግ።
    
    ጽሑፉ: {text}
    
    ቁልፍ ቃላት:
    """
    
    @classmethod
    def get_template(cls, template_name: str, **kwargs) -> str:
        """Get and format a prompt template"""
        
        template = getattr(cls, template_name.upper(), None)
        if not template:
            raise ValueError(f"Template {template_name} not found")
        
        return template.format(**kwargs)
    
    @classmethod
    def get_system_prompt(cls, language: str) -> str:
        """Get system prompt based on language"""
        
        if language == 'am':
            return cls.AMHARIC_SYSTEM
        elif language == 'bilingual':
            return cls.BILINGUAL_SYSTEM
        else:
            return cls.ENGLISH_SYSTEM
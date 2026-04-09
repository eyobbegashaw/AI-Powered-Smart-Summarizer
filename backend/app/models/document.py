from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Index, BigInteger
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), index=True)
    filename = Column(String(500))
    original_filename = Column(String(500))
    file_size = Column(Integer)  # in bytes
    mime_type = Column(String(100))
    s3_key = Column(String(500))
    text_content = Column(Text)
    word_count = Column(Integer)
    language = Column(String(20))  # 'am', 'en', 'bilingual'
    page_count = Column(Integer, default=0)
    processing_time = Column(BigInteger)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    summaries = relationship("Summary", back_populates="document", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_document_user_created', 'user_id', 'created_at'),
        Index('idx_document_language', 'language'),
    )
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, ARRAY, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Summary(Base):
    __tablename__ = "summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), index=True)
    summary_type = Column(String(50), nullable=False)  # 'bullets', 'paragraph', 'section'
    summary_length = Column(String(20), nullable=False)  # 'short', 'medium', 'long'
    summary_text = Column(Text, nullable=False)
    summary_text_am = Column(Text)  # Amharic version if applicable
    keywords = Column(ARRAY(String))
    processing_time = Column(Float)  # In seconds
    model_used = Column(String(100))
    is_favorite = Column(Integer, default=0)  # 0 = no, 1 = yes
    feedback_score = Column(Integer, nullable=True)  # 1-5 star rating
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    document = relationship("Document", back_populates="summaries")
    
    # Indexes
    __table_args__ = (
        Index('idx_summary_document_type', 'document_id', 'summary_type', 'summary_length'),
        Index('idx_summary_user_created', 'user_id', 'created_at'),
    )
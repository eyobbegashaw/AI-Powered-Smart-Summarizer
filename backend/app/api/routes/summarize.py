from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List
from sqlalchemy.orm import Session
from loguru import logger
import time

from app.core.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.summary import Summary
from app.services.summarizer.amharic_summarizer import AmharicSummarizer
from app.core.security import get_current_user
from app.api.dependencies import check_rate_limit, check_subscription_limit
from app.core.config import settings

router = APIRouter()
summarizer = AmharicSummarizer()


class SummarizeRequest(BaseModel):
    summary_type: str = Field("paragraph")
    summary_length: str = Field("medium")


class SummarizeResponse(BaseModel):
    summary_id: int
    summary_text: str
    summary_am: Optional[str]
    keywords: List[str]
    word_count: int
    processing_time: float


@router.post("/document/{document_id}", response_model=SummarizeResponse)
async def summarize_document(
    document_id: int,
    request: SummarizeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    rate_limit: bool = Depends(check_rate_limit),
    subscription_limit: bool = Depends(check_subscription_limit)
):
    """Generate summary for a document"""
    
    logger.debug(f"Summarize request - document_id: {document_id}, summary_type: {request.summary_type}, summary_length: {request.summary_length}")
    
    # Log request details for debugging
    logger.debug(f"Request object: {request}")
    logger.debug(f"Request dict: {request.dict()}")
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not document.text_content:
        raise HTTPException(status_code=400, detail="Document has no extractable text")
    
    existing_summary = db.query(Summary).filter(
        Summary.document_id == document_id,
        Summary.summary_type == request.summary_type,
        Summary.summary_length == request.summary_length,
        Summary.user_id == current_user.id
    ).first()
    
    if existing_summary:
        return SummarizeResponse(
            summary_id=existing_summary.id,
            summary_text=existing_summary.summary_text,
            summary_am=existing_summary.summary_text_am,
            keywords=existing_summary.keywords or [],
            word_count=len(existing_summary.summary_text.split()),
            processing_time=existing_summary.processing_time
        )
    
    start_time = time.time()
    
    try:
        result = await summarizer.summarize(
            text=document.text_content,
            summary_type=request.summary_type,
            length=request.summary_length,
            user_id=current_user.id
        )
        
        processing_time = time.time() - start_time
        
        summary = Summary(
            document_id=document_id,
            user_id=current_user.id,
            summary_type=request.summary_type,
            summary_length=request.summary_length,
            summary_text=result['summary'],
            summary_text_am=result.get('summary_am'),
            keywords=result['keywords'],
            processing_time=processing_time,
            model_used=settings.OPENAI_MODEL
        )
        
        db.add(summary)
        current_user.summary_count += 1
        db.commit()
        db.refresh(summary)
        
        if not document.language:
            document.language = result['language']
            db.commit()
        
        return SummarizeResponse(
            summary_id=summary.id,
            summary_text=summary.summary_text,
            summary_am=summary.summary_text_am,
            keywords=summary.keywords or [],
            word_count=len(summary.summary_text.split()),
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Summarization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")


@router.post("/text")
async def summarize_text(
    text: str,
    summary_type: str = "paragraph",
    summary_length: str = "medium",
    current_user: User = Depends(get_current_user)
):
    """Quick summarize without saving to database"""
    
    try:
        result = await summarizer.summarize(
            text=text,
            summary_type=summary_type,
            length=summary_length
        )
        return result
    except Exception as e:
        logger.error(f"Text summarization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
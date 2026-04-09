from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.user import User
from app.models.summary import Summary
from app.models.document import Document
from app.core.security import get_current_user
from app.services.export_service import ExportService

router = APIRouter()
export_service = ExportService()


@router.get("/summaries")
async def get_summary_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    summary_type: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's summary history"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    offset = (page - 1) * limit
    
    query = db.query(Summary).filter(Summary.user_id == current_user.id)
    
    if summary_type:
        query = query.filter(Summary.summary_type == summary_type)
    if date_from:
        query = query.filter(Summary.created_at >= date_from)
    if date_to:
        query = query.filter(Summary.created_at <= date_to)
    
    total = query.count()
    summaries = query.order_by(Summary.created_at.desc()).offset(offset).limit(limit).all()
    
    result = []
    for summary in summaries:
        document = db.query(Document).filter(Document.id == summary.document_id).first()
        result.append({
            "id": summary.id,
            "document_id": summary.document_id,
            "document_name": document.original_filename if document else "Unknown",
            "summary_type": summary.summary_type,
            "summary_length": summary.summary_length,
            "summary_preview": summary.summary_text[:200] + "..." if len(summary.summary_text) > 200 else summary.summary_text,
            "keywords": summary.keywords,
            "created_at": summary.created_at,
            "is_favorite": summary.is_favorite
        })
    
    return {
        "summaries": result,
        "page": page,
        "limit": limit,
        "total": total,
        "pages": (total + limit - 1) // limit
    }


@router.get("/summaries/{summary_id}")
async def get_summary_detail(
    summary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed summary information"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    summary = db.query(Summary).filter(
        Summary.id == summary_id,
        Summary.user_id == current_user.id
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    document = db.query(Document).filter(Document.id == summary.document_id).first()
    
    return {
        "id": summary.id,
        "document": {
            "id": document.id,
            "name": document.original_filename,
            "word_count": document.word_count,
            "language": document.language
        },
        "summary_type": summary.summary_type,
        "summary_length": summary.summary_length,
        "summary_text": summary.summary_text,
        "summary_text_am": summary.summary_text_am,
        "keywords": summary.keywords,
        "processing_time": summary.processing_time,
        "model_used": summary.model_used,
        "created_at": summary.created_at
    }


@router.post("/summaries/{summary_id}/favorite")
async def toggle_favorite(
    summary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle favorite status for a summary"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    summary = db.query(Summary).filter(
        Summary.id == summary_id,
        Summary.user_id == current_user.id
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    summary.is_favorite = 1 if summary.is_favorite == 0 else 0
    db.commit()
    
    return {"is_favorite": summary.is_favorite}


@router.delete("/summaries/{summary_id}")
async def delete_summary(
    summary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a summary"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    summary = db.query(Summary).filter(
        Summary.id == summary_id,
        Summary.user_id == current_user.id
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    db.delete(summary)
    db.commit()
    
    return {"message": "Summary deleted successfully"}


@router.get("/summaries/{summary_id}/export")
async def export_summary(
    summary_id: int,
    format: str = Query(..., regex="^(pdf|docx|txt)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export summary to specified format"""
    
    from fastapi.responses import StreamingResponse
    import io
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    summary = db.query(Summary).filter(
        Summary.id == summary_id,
        Summary.user_id == current_user.id
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    document = db.query(Document).filter(Document.id == summary.document_id).first()
    
    file_content = await export_service.export_summary(
        summary=summary,
        document=document,
        format=format,
        include_keywords=True,
        user=current_user
    )
    
    return StreamingResponse(
        io.BytesIO(file_content),
        media_type=export_service.get_mime_type(format),
        headers={"Content-Disposition": f"attachment; filename=summary_{summary_id}.{format}"}
    )
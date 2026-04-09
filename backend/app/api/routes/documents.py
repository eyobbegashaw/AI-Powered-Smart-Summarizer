from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import os
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.document import Document
from app.services.document_processor.document_processor import DocumentProcessor
from app.api.dependencies import check_rate_limit
from app.core.security import get_current_user
from app.core.config import settings

router = APIRouter()
doc_processor = DocumentProcessor()


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    rate_limit: bool = Depends(check_rate_limit)
):
    print(f"DEBUG: Filename: {file.filename}, Size: {file.size}, Type: {file.content_type}")
    """Upload and process a document"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    content = await file.read()
    file_size = len(content)
    
    if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        print(f"ERROR: File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit for file {file.filename}")
        raise HTTPException(status_code=400, detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit")
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    print(f"DEBUG: Extracted extension: '{file_extension}'")
    print(f"DEBUG: Allowed extensions: {settings.ALLOWED_EXTENSIONS}")
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        print(f"ERROR: File type {file_extension} not supported for file {file.filename}")
        raise HTTPException(status_code=400, detail=f"File type {file_extension} not supported")
    
    try:
        print(f"DEBUG: Starting file processing for {file.filename}")
        processed = await doc_processor.process_file(content, file.filename)
        print(f"DEBUG: File processing completed successfully")
    except Exception as e:
        print(f"ERROR: File processing failed: {str(e)} for file {file.filename}")
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
    
    document = Document(
        user_id=current_user.id,
        filename=str(uuid.uuid4()) + file_extension,
        original_filename=file.filename,
        file_size=file_size,
        mime_type=file.content_type,
        text_content=processed['text'],
        word_count=processed['word_count'],
        language=None,
        processing_time=int(processed.get('processing_time', 0))
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return {
        "id": document.id,
        "original_filename": document.original_filename,
        "file_size": document.file_size,
        "word_count": document.word_count,
        "created_at": document.created_at
    }


@router.post("/url")
async def process_url(
    url: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    rate_limit: bool = Depends(check_rate_limit)
):
    """Process document from URL"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        processed = await doc_processor.process_url(url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process URL: {str(e)}")
    
    document = Document(
        user_id=current_user.id,
        filename=f"url_{uuid.uuid4()}.txt",
        original_filename=processed.get('title', 'Untitled'),
        file_size=len(processed['text']),
        mime_type="text/html",
        text_content=processed['text'],
        word_count=processed['word_count'],
        language=None
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return {
        "id": document.id,
        "original_filename": document.original_filename,
        "url": url,
        "word_count": document.word_count,
        "created_at": document.created_at
    }


@router.post("/text")
async def process_text(
    text: str = Form(...),
    title: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process plain text input"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    word_count = len(text.split())
    
    document = Document(
        user_id=current_user.id,
        filename=f"text_{uuid.uuid4()}.txt",
        original_filename=title or "Untitled Text",
        file_size=len(text),
        mime_type="text/plain",
        text_content=text,
        word_count=word_count,
        language=None
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return {
        "id": document.id,
        "original_filename": document.original_filename,
        "word_count": document.word_count,
        "created_at": document.created_at
    }


@router.get("/{document_id}")
async def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get document details"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "id": document.id,
        "original_filename": document.original_filename,
        "file_size": document.file_size,
        "word_count": document.word_count,
        "language": document.language,
        "text_content": document.text_content,
        "created_at": document.created_at
    }


@router.get("/")
async def list_documents(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List user documents"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    documents = db.query(Document).filter(
        Document.user_id == current_user.id
    ).order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "documents": [
            {
                "id": doc.id,
                "original_filename": doc.original_filename,
                "word_count": doc.word_count,
                "language": doc.language,
                "created_at": doc.created_at
            }
            for doc in documents
        ],
        "total": len(documents)
    }


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a document"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}
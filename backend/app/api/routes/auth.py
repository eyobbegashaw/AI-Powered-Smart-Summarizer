from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import timedelta
from urllib.parse import urlencode

from app.core.database import get_db
from app.core.security import (
    get_password_hash, verify_password, create_access_token,
    create_refresh_token, get_current_user, generate_api_key
)
from app.models.user import User
from app.core.config import settings
from app.services.oauth_service import oauth, oauth_service

router = APIRouter()


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=200)
    password: str = Field(..., min_length=8)
    company: Optional[str] = None
    preferred_language: str = "en"


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    company: Optional[str]
    preferred_language: str
    subscription_tier: str
    monthly_limit: int
    summary_count: int
    avatar_url: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_data.password)
    api_key = generate_api_key()
    
    db_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        company=user_data.company,
        preferred_language=user_data.preferred_language,
        password_hash=hashed_password,
        api_key=api_key,
        subscription_tier="free",
        monthly_limit=50,
        summary_count=0,
        is_active=True,
        is_verified=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse(
        id=db_user.id,
        email=db_user.email,
        full_name=db_user.full_name,
        company=db_user.company,
        preferred_language=db_user.preferred_language,
        subscription_tier=db_user.subscription_tier,
        monthly_limit=db_user.monthly_limit,
        summary_count=db_user.summary_count
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login with email and password"""
    
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not user.password_hash or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            company=user.company,
            preferred_language=user.preferred_language,
            subscription_tier=user.subscription_tier,
            monthly_limit=user.monthly_limit,
            summary_count=user.summary_count,
            avatar_url=user.avatar_url
        )
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    
    from app.core.security import verify_token
    
    payload = verify_token(refresh_token, "refresh")
    user_id = payload.get("sub")
    
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            company=user.company,
            preferred_language=user.preferred_language,
            subscription_tier=user.subscription_tier,
            monthly_limit=user.monthly_limit,
            summary_count=user.summary_count,
            avatar_url=user.avatar_url
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        company=current_user.company,
        preferred_language=current_user.preferred_language,
        subscription_tier=current_user.subscription_tier,
        monthly_limit=current_user.monthly_limit,
        summary_count=current_user.summary_count,
        avatar_url=current_user.avatar_url
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user"""
    return {"message": "Successfully logged out"}


@router.get("/google/login")
async def google_login(request: Request):
    """Initiate Google OAuth login"""
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """Handle Google OAuth callback"""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = await oauth_service.get_google_user_info(token['access_token'])
        user_data = await oauth_service.create_or_get_user(db, user_info, 'google')
        
        access_token = create_access_token(data={"sub": str(user_data['id'])})
        refresh_token = create_refresh_token(data={"sub": str(user_data['id'])})
        
        params = urlencode({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user_id': user_data['id'],
            'email': user_data['email'],
            'name': user_data['full_name'],
            'avatar': user_data.get('avatar_url', ''),
            'is_new': str(user_data['is_new']).lower()
        })
        
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback?{params}")
        
    except Exception as e:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=google_auth_failed")


@router.get("/github/login")
async def github_login(request: Request):
    """Initiate GitHub OAuth login"""
    redirect_uri = settings.GITHUB_REDIRECT_URI
    return await oauth.github.authorize_redirect(request, redirect_uri)


@router.get("/github/callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    """Handle GitHub OAuth callback"""
    try:
        token = await oauth.github.authorize_access_token(request)
        user_info = await oauth_service.get_github_user_info(token['access_token'])
        user_data = await oauth_service.create_or_get_user(db, user_info, 'github')
        
        access_token = create_access_token(data={"sub": str(user_data['id'])})
        refresh_token = create_refresh_token(data={"sub": str(user_data['id'])})
        
        params = urlencode({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user_id': user_data['id'],
            'email': user_data['email'],
            'name': user_data['full_name'],
            'avatar': user_data.get('avatar_url', ''),
            'is_new': str(user_data['is_new']).lower()
        })
        
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback?{params}")
        
    except Exception as e:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=github_auth_failed")


@router.get("/oauth/providers")
async def get_oauth_providers():
    """Get available OAuth providers"""
    providers = []
    
    if settings.GOOGLE_CLIENT_ID:
        providers.append({
            'name': 'google',
            'display_name': 'Google',
            'icon': 'google',
            'color': '#4285F4',
            'login_url': '/api/auth/google/login'
        })
    
    if settings.GITHUB_CLIENT_ID:
        providers.append({
            'name': 'github',
            'display_name': 'GitHub',
            'icon': 'github',
            'color': '#333',
            'login_url': '/api/auth/github/login'
        })
    
    return {'providers': providers}
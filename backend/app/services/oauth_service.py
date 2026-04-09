from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from fastapi import HTTPException
from typing import Dict
import httpx
from loguru import logger

from app.core.config import settings
from app.models.user import User
from app.core.security import get_password_hash, generate_api_key

# Initialize OAuth
oauth = OAuth()

# Configure OAuth providers
if settings.GOOGLE_CLIENT_ID:
    oauth.register(
        name='google',
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile',
            'redirect_uri': settings.GOOGLE_REDIRECT_URI
        }
    )

if settings.GITHUB_CLIENT_ID:
    oauth.register(
        name='github',
        client_id=settings.GITHUB_CLIENT_ID,
        client_secret=settings.GITHUB_CLIENT_SECRET,
        access_token_url='https://github.com/login/oauth/access_token',
        authorize_url='https://github.com/login/oauth/authorize',
        api_base_url='https://api.github.com/',
        client_kwargs={'scope': 'user:email read:user'},
        redirect_uri=settings.GITHUB_REDIRECT_URI
    )


class OAuthService:
    """Service for handling OAuth authentication"""
    
    @staticmethod
    async def get_google_user_info(access_token: str) -> Dict:
        """Fetch user info from Google"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    headers={'Authorization': f'Bearer {access_token}'}
                )
                response.raise_for_status()
                data = response.json()
                return {
                    'email': data.get('email'),
                    'name': data.get('name'),
                    'sub': data.get('sub'),
                    'avatar_url': data.get('picture'),
                    'verified_email': data.get('email_verified', False)
                }
        except Exception as e:
            logger.error(f"Failed to fetch Google user info: {e}")
            raise HTTPException(status_code=400, detail="Failed to fetch user info from Google")
    
    @staticmethod
    async def get_github_user_info(access_token: str) -> Dict:
        """Fetch user info from GitHub"""
        try:
            async with httpx.AsyncClient() as client:
                user_response = await client.get(
                    'https://api.github.com/user',
                    headers={'Authorization': f'token {access_token}'}
                )
                user_response.raise_for_status()
                user_data = user_response.json()
                
                email_response = await client.get(
                    'https://api.github.com/user/emails',
                    headers={'Authorization': f'token {access_token}'}
                )
                email_response.raise_for_status()
                emails = email_response.json()
                
                primary_email = next(
                    (email['email'] for email in emails if email.get('primary')),
                    emails[0]['email'] if emails else None
                )
                
                return {
                    'email': primary_email,
                    'name': user_data.get('name', user_data.get('login')),
                    'avatar_url': user_data.get('avatar_url'),
                    'github_id': str(user_data.get('id'))
                }
        except Exception as e:
            logger.error(f"Failed to fetch GitHub user info: {e}")
            raise HTTPException(status_code=400, detail="Failed to fetch user info from GitHub")
    
    @staticmethod
    async def create_or_get_user(db, user_info: Dict, provider: str) -> Dict:
        """Create or get existing user from OAuth data"""
        
        email = user_info.get('email')
        if not email:
            raise HTTPException(status_code=400, detail=f"No email provided from {provider}")
        
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            if provider == 'google' and not user.google_id:
                user.google_id = user_info.get('sub')
            elif provider == 'github' and not user.github_id:
                user.github_id = user_info.get('github_id')
            
            if not user.avatar_url and user_info.get('avatar_url'):
                user.avatar_url = user_info.get('avatar_url')
            
            db.commit()
            db.refresh(user)
            
            return {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'avatar_url': user.avatar_url,
                'is_new': False
            }
        
        name = user_info.get('name', email.split('@')[0])
        api_key = generate_api_key()
        
        new_user = User(
            email=email,
            full_name=name,
            password_hash=get_password_hash(generate_api_key()),
            api_key=api_key,
            subscription_tier='free',
            monthly_limit=50,
            summary_count=0,
            is_active=True,
            is_verified=True,
            google_id=user_info.get('sub') if provider == 'google' else None,
            github_id=user_info.get('github_id') if provider == 'github' else None,
            avatar_url=user_info.get('avatar_url'),
            preferred_language='en'
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {
            'id': new_user.id,
            'email': new_user.email,
            'full_name': new_user.full_name,
            'avatar_url': new_user.avatar_url,
            'is_new': True
        }


oauth_service = OAuthService()
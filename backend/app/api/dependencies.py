from fastapi import HTTPException, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.core.security import get_current_user
from app.core.config import settings
from app.core.redis_client import redis_client
from app.models.user import User
from app.core.database import get_db


async def check_rate_limit(
    request: Request,
    current_user: Optional[User] = Depends(get_current_user)
) -> bool:
    """Check if user has exceeded rate limit"""
    
    if not current_user:
        return True
    
    if not redis_client.is_connected():
        return True  # Skip rate limiting if Redis is down
    
    # Different limits for different subscription tiers
    limits = {
        "free": 50,
        "pro": 500,
        "enterprise": 5000
    }
    
    limit = limits.get(current_user.subscription_tier, 50)
    key = f"rate_limit:{current_user.id}:{datetime.utcnow().date()}"
    
    current_count = await redis_client.get(key)
    current_count = int(current_count) if current_count else 0
    
    if current_count >= limit:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Maximum {limit} requests per day."
        )
    
    await redis_client.incr(key)
    await redis_client.expire(key, 86400)
    
    return True


async def check_subscription_limit(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> bool:
    """Check if user has reached monthly summary limit"""
    
    if not current_user:
        return True
    
    from app.models.summary import Summary
    
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
    
    summary_count = db.query(Summary).filter(
        Summary.user_id == current_user.id,
        Summary.created_at >= start_of_month
    ).count()
    
    if summary_count >= current_user.monthly_limit:
        raise HTTPException(
            status_code=403,
            detail=f"You've reached your monthly limit of {current_user.monthly_limit} summaries."
        )
    
    return True
from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware 
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import sys
from dotenv import load_dotenv

load_dotenv()

from app.core.config import settings
from app.core.database import engine, Base
from app.core.redis_client import redis_client
from app.api.routes import auth, documents, summarize, history

# Configure logging
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan> - <level>{message}</level>",
    level="INFO"
)
logger.add(
    "logs/summarizer_{time:YYYY-MM-DD}.log",
    rotation="1 day",
    retention="30 days",
    level="DEBUG"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    logger.info("Starting AI-Powered Smart Summarizer...")
    Base.metadata.create_all(bind=engine)
    await redis_client.initialize()
    logger.info(f"Server started on {settings.API_HOST}:{settings.API_PORT}")
    yield
    # Shutdown
    await redis_client.close()
    logger.info("Server shutdown complete")


app = FastAPI(
    title="AI Smart Summarizer API",
    description="Multi-language document summarization with Amharic support",
    version="1.0.0",
    lifespan=lifespan
)

# ... ከ app = FastAPI(...) በታች ይህንን ጨምር
app.add_middleware(
    SessionMiddleware, 
    secret_key=settings.SECRET_KEY
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(summarize.router, prefix="/api/summarize", tags=["Summarization"])
app.include_router(history.router, prefix="/api/history", tags=["History"])


@app.get("/")
async def root():
    return {
        "message": "AI Smart Summarizer API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "redis": redis_client.is_connected(),
        "database": "connected"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )
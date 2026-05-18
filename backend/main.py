"""
ShuleYetu FastAPI Application
Main entry point for the API server
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.database import engine, Base
from .core.config import settings
from .api import selections_router, comb_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup: Create tables (for development)
    # In production, use Alembic migrations
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: cleanup if needed


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.DESCRIPTION,
        version=settings.VERSION,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )
    
    # CORS middleware for Next.js frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(selections_router, prefix=settings.API_V1_PREFIX)
    app.include_router(comb_router, prefix=f"{settings.API_V1_PREFIX}/comb")
    
    @app.get("/")
    def root():
        """Root endpoint with API info."""
        return {
            "name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "description": settings.DESCRIPTION,
            "docs": "/docs",
        }
    
    @app.get("/health")
    def health_check():
        """Health check endpoint."""
        return {"status": "healthy"}
    
    return app


# Create app instance for uvicorn
app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )

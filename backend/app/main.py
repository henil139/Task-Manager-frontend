from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, Base
from .routers import (
    auth_router,
    profiles_router,
    users_router,
    projects_router,
    tasks_router,
    comments_router,
    audit_logs_router
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Management API",
    description="FastAPI backend for Task Management System",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(profiles_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(comments_router, prefix="/api")
app.include_router(audit_logs_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Task Management API", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

"""Comment schemas matching the integer ID schema"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .user import ProfileResponse


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    content: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool = False
    user: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True

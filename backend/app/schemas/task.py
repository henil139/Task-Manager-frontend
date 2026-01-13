"""Task schemas matching the integer ID schema"""
from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from enum import Enum
from .user import ProfileResponse


class TaskStatus(str, Enum):
    to_do = "to_do"
    in_progress = "in_progress"
    under_review = "under_review"
    completed = "completed"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.to_do
    priority: TaskPriority = TaskPriority.medium
    due_date: Optional[date] = None
    assigned_to: Optional[int] = None
    project_id: int


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[date] = None
    assigned_to: Optional[int] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: TaskStatus
    priority: TaskPriority
    due_date: Optional[date] = None
    assigned_to: Optional[int] = None
    project_id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    is_deleted: bool = False
    
    # Nested profiles
    assignee: Optional[ProfileResponse] = None
    creator: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True

"""Project schemas matching the integer ID schema"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from .user import ProfileResponse


class ProjectMemberResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    created_at: datetime
    user: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    is_deleted: bool = False

    class Config:
        from_attributes = True


class ProjectWithMembers(ProjectResponse):
    members: List[ProjectMemberResponse] = []


class AddMemberRequest(BaseModel):
    user_id: int

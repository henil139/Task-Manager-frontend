"""AuditLog schemas matching the integer ID schema"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum
from .user import ProfileResponse


class OperationType(str, Enum):
    insert = "insert"
    update = "update"
    delete = "delete"


class AuditLogResponse(BaseModel):
    id: int
    table_name: str
    record_id: int
    operation: OperationType
    changed_data: Optional[dict] = None
    changed_at: datetime
    changed_by: Optional[int] = None
    
    # Nested user info
    user: Optional[ProfileResponse] = None
    old_assignee: Optional[ProfileResponse] = None
    new_assignee: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True

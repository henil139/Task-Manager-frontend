"""Audit log routes"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.audit_log import AuditLog, OperationType
from ..schemas.audit_log import AuditLogResponse
from ..schemas.user import ProfileResponse
from ..auth import require_admin

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


def user_to_profile(user: User) -> ProfileResponse:
    """Convert User model to ProfileResponse"""
    if not user:
        return None
    return ProfileResponse(
        id=user.id,
        user_id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.username,
        avatar_url=None,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.get("", response_model=List[AuditLogResponse])
async def list_audit_logs(
    limit: int = Query(100, le=1000),
    task_id: Optional[int] = Query(None),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List audit logs (admin only)"""
    query = db.query(AuditLog).order_by(AuditLog.changed_at.desc())
    
    if task_id:
        query = query.filter(
            AuditLog.record_id == task_id,
            AuditLog.table_name == "tasks"
        )
    
    logs = query.limit(limit).all()
    result = []
    
    for log in logs:
        changed_by_user = db.query(User).filter(User.id == log.changed_by).first() if log.changed_by else None
        
        old_assignee = None
        new_assignee = None
        if log.changed_data and "assigned_to" in log.changed_data:
            old_id = log.changed_data["assigned_to"].get("old")
            new_id = log.changed_data["assigned_to"].get("new")
            if old_id:
                old_user = db.query(User).filter(User.id == old_id).first()
                old_assignee = user_to_profile(old_user)
            if new_id:
                new_user = db.query(User).filter(User.id == new_id).first()
                new_assignee = user_to_profile(new_user)
        
        result.append(AuditLogResponse(
            id=log.id,
            table_name=log.table_name,
            record_id=log.record_id,
            operation=log.operation,
            changed_data=log.changed_data,
            changed_at=log.changed_at,
            changed_by=log.changed_by,
            user=user_to_profile(changed_by_user),
            old_assignee=old_assignee,
            new_assignee=new_assignee
        ))
    
    return result

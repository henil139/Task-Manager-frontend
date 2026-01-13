"""Task routes"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.project import Project, ProjectMember
from ..models.task import Task
from ..models.audit_log import AuditLog, OperationType
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse
from ..schemas.user import ProfileResponse
from ..auth import get_current_user, is_admin

router = APIRouter(prefix="/tasks", tags=["Tasks"])


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


def get_task_response(task: Task, db: Session) -> TaskResponse:
    """Build TaskResponse with nested user profiles"""
    assignee = db.query(User).filter(User.id == task.assigned_to).first() if task.assigned_to else None
    creator = db.query(User).filter(User.id == task.created_by).first() if task.created_by else None
    
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        assigned_to=task.assigned_to,
        project_id=task.project_id,
        created_by=task.created_by,
        created_at=task.created_at,
        updated_at=task.updated_at,
        is_deleted=task.is_deleted,
        assignee=user_to_profile(assignee),
        creator=user_to_profile(creator)
    )


def can_access_project(user: User, project_id: int, db: Session) -> bool:
    """Check if user can access a project"""
    if is_admin(user, db):
        return True
    project = db.query(Project).filter(Project.id == project_id).first()
    if project and project.created_by == user.id:
        return True
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id
    ).first()
    return member is not None


def create_audit_log(
    db: Session,
    table_name: str,
    record_id: int,
    operation: OperationType,
    changed_data: dict,
    changed_by: int
):
    """Create an audit log entry"""
    log = AuditLog(
        table_name=table_name,
        record_id=record_id,
        operation=operation,
        changed_data=changed_data,
        changed_by=changed_by
    )
    db.add(log)


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    project_id: Optional[int] = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all tasks accessible to the user"""
    query = db.query(Task).filter(Task.is_deleted == False)
    
    if project_id:
        if not can_access_project(user, project_id, db):
            raise HTTPException(status_code=403, detail="Not authorized to access this project")
        query = query.filter(Task.project_id == project_id)
    elif not is_admin(user, db):
        accessible_projects = db.query(ProjectMember.project_id).filter(
            ProjectMember.user_id == user.id
        ).union(
            db.query(Project.id).filter(Project.created_by == user.id)
        )
        query = query.filter(Task.project_id.in_(accessible_projects))
    
    tasks = query.order_by(Task.created_at.desc()).all()
    return [get_task_response(t, db) for t in tasks]


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific task"""
    task = db.query(Task).filter(Task.id == task_id, Task.is_deleted == False).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if not can_access_project(user, task.project_id, db):
        raise HTTPException(status_code=403, detail="Not authorized to access this task")
    
    return get_task_response(task, db)


@router.post("", response_model=TaskResponse)
async def create_task(
    data: TaskCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task"""
    if not can_access_project(user, data.project_id, db):
        raise HTTPException(status_code=403, detail="Not authorized to create tasks in this project")
    
    existing = db.query(Task).filter(Task.title == data.title, Task.is_deleted == False).first()
    if existing:
        raise HTTPException(status_code=400, detail="Task title must be unique")
    
    task = Task(
        title=data.title,
        description=data.description,
        status=data.status,
        priority=data.priority,
        due_date=data.due_date,
        assigned_to=data.assigned_to,
        project_id=data.project_id,
        created_by=user.id
    )
    db.add(task)
    db.flush()
    
    create_audit_log(
        db=db,
        table_name="tasks",
        record_id=task.id,
        operation=OperationType.insert,
        changed_data={"title": task.title, "status": task.status.value if task.status else None},
        changed_by=user.id
    )
    
    db.commit()
    db.refresh(task)
    
    return get_task_response(task, db)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    data: TaskUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a task"""
    task = db.query(Task).filter(Task.id == task_id, Task.is_deleted == False).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if not can_access_project(user, task.project_id, db):
        raise HTTPException(status_code=403, detail="Not authorized to update this task")
    
    changes = {}
    
    if data.title is not None and data.title != task.title:
        existing = db.query(Task).filter(
            Task.title == data.title, 
            Task.id != task_id,
            Task.is_deleted == False
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Task title must be unique")
        changes["title"] = {"old": task.title, "new": data.title}
        task.title = data.title
    
    if data.description is not None:
        changes["description"] = {"old": task.description, "new": data.description}
        task.description = data.description
    
    if data.status is not None and data.status != task.status:
        changes["status"] = {"old": task.status.value if task.status else None, "new": data.status.value}
        task.status = data.status
    
    if data.priority is not None and data.priority != task.priority:
        changes["priority"] = {"old": task.priority.value if task.priority else None, "new": data.priority.value}
        task.priority = data.priority
    
    if data.due_date is not None:
        changes["due_date"] = {"old": str(task.due_date) if task.due_date else None, "new": str(data.due_date)}
        task.due_date = data.due_date
    
    if data.assigned_to is not None:
        changes["assigned_to"] = {"old": task.assigned_to, "new": data.assigned_to}
        task.assigned_to = data.assigned_to
    
    task.updated_by = user.id
    
    if changes:
        create_audit_log(
            db=db,
            table_name="tasks",
            record_id=task.id,
            operation=OperationType.update,
            changed_data=changes,
            changed_by=user.id
        )
    
    db.commit()
    db.refresh(task)
    
    return get_task_response(task, db)


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Soft delete a task (admin only)"""
    if not is_admin(user, db):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    task = db.query(Task).filter(Task.id == task_id, Task.is_deleted == False).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.is_deleted = True
    task.updated_by = user.id
    
    create_audit_log(
        db=db,
        table_name="tasks",
        record_id=task.id,
        operation=OperationType.delete,
        changed_data={"deleted": True},
        changed_by=user.id
    )
    
    db.commit()
    
    return {"message": "Task deleted successfully"}

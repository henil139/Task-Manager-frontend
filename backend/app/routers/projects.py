from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User, Profile
from ..models.project import Project, ProjectMember
from ..schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectResponse, 
    ProjectWithMembers, ProjectMemberResponse, AddMemberRequest
)
from ..schemas.user import ProfileResponse
from ..auth import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    return [ProjectResponse.model_validate(p) for p in projects]


@router.post("", response_model=ProjectResponse)
async def create_project(
    data: ProjectCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = Project(
        name=data.name,
        description=data.description,
        created_by=user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.get("/{project_id}", response_model=ProjectWithMembers)
async def get_project(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get members with profiles
    members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
    members_with_profiles = []
    
    for member in members:
        profile = db.query(Profile).filter(Profile.user_id == member.user_id).first()
        members_with_profiles.append(ProjectMemberResponse(
            id=member.id,
            project_id=member.project_id,
            user_id=member.user_id,
            created_at=member.created_at,
            profile=ProfileResponse.model_validate(profile) if profile else None
        ))
    
    return ProjectWithMembers(
        id=project.id,
        name=project.name,
        description=project.description,
        created_by=project.created_by,
        created_at=project.created_at,
        updated_at=project.updated_at,
        members=members_with_profiles
    )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.delete("/{project_id}")
async def delete_project(
    project_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}


@router.post("/{project_id}/members")
async def add_member(
    project_id: UUID,
    data: AddMemberRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if already a member
    existing = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == data.user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")
    
    member = ProjectMember(project_id=project_id, user_id=data.user_id)
    db.add(member)
    db.commit()
    return {"message": "Member added"}


@router.delete("/{project_id}/members/{user_id}")
async def remove_member(
    project_id: UUID,
    user_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    db.delete(member)
    db.commit()
    return {"message": "Member removed"}

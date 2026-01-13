from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User, Profile, UserRole, AppRole
from ..schemas.user import UserWithRole, RoleUpdate
from ..auth import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserWithRole])
async def list_users_with_roles(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profiles = db.query(Profile).order_by(Profile.full_name).all()
    result = []
    
    for profile in profiles:
        role_record = db.query(UserRole).filter(UserRole.user_id == profile.user_id).first()
        role = role_record.role if role_record else AppRole.user
        
        result.append(UserWithRole(
            id=profile.id,
            email=profile.email,
            full_name=profile.full_name,
            avatar_url=profile.avatar_url,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
            role=role
        ))
    
    return result


@router.get("/user-roles/{user_id}")
async def get_user_role(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    # Find profile by profile.id (frontend uses profile.id as user identifier)
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    role_record = db.query(UserRole).filter(UserRole.user_id == profile.user_id).first()
    return {"role": role_record.role if role_record else AppRole.user}


@router.put("/user-roles/{user_id}")
async def update_user_role(
    user_id: UUID,
    data: RoleUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Find profile by profile.id
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    role_record = db.query(UserRole).filter(UserRole.user_id == profile.user_id).first()
    
    if role_record:
        role_record.role = data.role
    else:
        role_record = UserRole(user_id=profile.user_id, role=data.role)
        db.add(role_record)
    
    db.commit()
    return {"role": data.role}

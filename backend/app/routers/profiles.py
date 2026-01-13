from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User, Profile
from ..schemas.user import ProfileResponse, ProfileUpdate
from ..auth import get_current_user

router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.get("", response_model=List[ProfileResponse])
async def list_profiles(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profiles = db.query(Profile).order_by(Profile.full_name).all()
    return [ProfileResponse.model_validate(p) for p in profiles]


@router.get("/{profile_id}", response_model=ProfileResponse)
async def get_profile(profile_id: UUID, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileResponse.model_validate(profile)


@router.put("/{profile_id}", response_model=ProfileResponse)
async def update_profile(
    profile_id: UUID,
    data: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Only allow users to update their own profile
    if profile.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return ProfileResponse.model_validate(profile)

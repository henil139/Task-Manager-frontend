"""User schemas matching the integer ID schema"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool = False

    class Config:
        from_attributes = True


class UserWithRole(UserResponse):
    role: Optional[str] = None


class RoleResponse(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserRoleResponse(BaseModel):
    id: int
    user_id: int
    role_id: int
    created_at: datetime
    role: Optional[RoleResponse] = None

    class Config:
        from_attributes = True


class ProfileResponse(BaseModel):
    """Profile response - maps user data for frontend compatibility"""
    id: int
    user_id: Optional[int] = None
    username: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    user: ProfileResponse
    role: str


class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UserRoleAssign(BaseModel):
    user_id: int
    role_name: str

"""Authentication routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User, Role, UserRole
from ..schemas.user import UserSignup, UserLogin, AuthResponse, ProfileResponse
from ..auth import verify_password, get_password_hash, create_access_token, get_current_user, get_user_role

router = APIRouter(prefix="/auth", tags=["Authentication"])


def user_to_profile(user: User) -> ProfileResponse:
    """Convert User model to ProfileResponse"""
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


@router.post("/signup", response_model=AuthResponse)
async def signup(data: UserSignup, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if email exists
    existing_email = db.query(User).filter(User.email == data.email, User.is_deleted == False).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username exists
    existing_username = db.query(User).filter(User.username == data.username, User.is_deleted == False).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    user = User(
        username=data.username,
        email=data.email,
        password=get_password_hash(data.password)
    )
    db.add(user)
    db.flush()
    
    # Assign default 'user' role
    user_role = db.query(Role).filter(Role.name == "user").first()
    if user_role:
        role_assignment = UserRole(user_id=user.id, role_id=user_role.id)
        db.add(role_assignment)
    
    db.commit()
    db.refresh(user)
    
    # Generate token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        access_token=access_token,
        user=user_to_profile(user),
        role="user"
    )


@router.post("/login", response_model=AuthResponse)
async def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate a user"""
    user = db.query(User).filter(User.email == data.email, User.is_deleted == False).first()
    
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Get user role
    role = get_user_role(user, db)
    
    # Generate token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        access_token=access_token,
        user=user_to_profile(user),
        role=role
    )


@router.get("/me", response_model=AuthResponse)
async def get_me(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile"""
    role = get_user_role(user, db)
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        access_token=access_token,
        user=user_to_profile(user),
        role=role
    )

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User, Profile
from ..models.task import Task
from ..models.comment import Comment
from ..schemas.comment import CommentCreate, CommentResponse
from ..schemas.user import ProfileResponse
from ..auth import get_current_user

router = APIRouter(tags=["Comments"])


@router.get("/tasks/{task_id}/comments", response_model=List[CommentResponse])
async def list_comments(
    task_id: UUID,
    db: Session = Depends(get_db)
):
    comments = db.query(Comment).filter(Comment.task_id == task_id).order_by(Comment.created_at).all()
    result = []
    
    for comment in comments:
        profile = db.query(Profile).filter(Profile.user_id == comment.user_id).first()
        result.append(CommentResponse(
            id=comment.id,
            task_id=comment.task_id,
            user_id=comment.user_id,
            content=comment.content,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            user=ProfileResponse.model_validate(profile) if profile else None
        ))
    
    return result


@router.post("/tasks/{task_id}/comments", response_model=CommentResponse)
async def create_comment(
    task_id: UUID,
    data: CommentCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    comment = Comment(
        task_id=task_id,
        user_id=user.id,
        content=data.content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    
    return CommentResponse(
        id=comment.id,
        task_id=comment.task_id,
        user_id=comment.user_id,
        content=comment.content,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        user=ProfileResponse.model_validate(profile) if profile else None
    )


@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Only allow owner to delete
    if comment.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted"}

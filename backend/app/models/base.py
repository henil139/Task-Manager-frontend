"""Base model with common audit fields"""
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import declared_attr

from ..database import Base


class AuditMixin:
    """Mixin for audit fields: created_at, created_by, updated_at, updated_by, is_deleted"""
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    
    @declared_attr
    def created_by(cls):
        return Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    @declared_attr
    def updated_by(cls):
        return Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

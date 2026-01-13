"""AuditLog model matching schema.sql"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import JSONB
import enum

from ..database import Base


class OperationType(str, enum.Enum):
    insert = "insert"
    update = "update"
    delete = "delete"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    table_name = Column(String(100), nullable=False)
    record_id = Column(Integer, nullable=False)
    operation = Column(Enum(OperationType), nullable=False)
    changed_data = Column(JSONB, nullable=True)
    changed_at = Column(DateTime, default=datetime.utcnow)
    changed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

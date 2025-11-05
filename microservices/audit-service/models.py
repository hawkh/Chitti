from sqlalchemy import Column, Integer, String, DateTime, JSON
from .database import Base
from pydantic import BaseModel
from datetime import datetime

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    action = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(JSON)

class AuditLogCreate(BaseModel):
    user_id: str
    action: str
    details: dict

class AuditLog(BaseModel):
    id: int
    user_id: str
    action: str
    timestamp: datetime
    details: dict

    class Config:
        orm_mode = True

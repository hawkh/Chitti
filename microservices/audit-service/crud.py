from sqlalchemy.orm import Session
from . import models
from datetime import datetime

def db_create_audit_log(db: Session, log: models.AuditLogCreate):
    db_log = models.AuditLog(user_id=log.user_id, action=log.action, details=log.details)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def db_read_audit_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.AuditLog).offset(skip).limit(limit).all()

def db_read_audit_logs_by_date_range(db: Session, start_date: datetime, end_date: datetime):
    return db.query(models.AuditLog).filter(models.AuditLog.timestamp >= start_date, models.AuditLog.timestamp <= end_date).all()

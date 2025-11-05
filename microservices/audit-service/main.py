from fastapi import FastAPI, Depends, Response
from sqlalchemy.orm import Session
from . import models, database, crud
from .database import engine
from typing import List
from datetime import datetime
import io
import csv

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Audit Service")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/audit/", response_model=models.AuditLog)
def create_audit_log(log: models.AuditLogCreate, db: Session = Depends(get_db)):
    return crud.db_create_audit_log(db=db, log=log)

@app.get("/audit/", response_model=List[models.AuditLog])
def read_audit_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    logs = crud.db_read_audit_logs(db, skip=skip, limit=limit)
    return logs

@app.get("/audit/export")
def export_audit_logs(
    start_date: datetime, 
    end_date: datetime, 
    db: Session = Depends(get_db)
):
    logs = crud.db_read_audit_logs_by_date_range(db, start_date=start_date, end_date=end_date)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["ID", "User ID", "Action", "Timestamp", "Details"])
    
    # Write data
    for log in logs:
        writer.writerow([log.id, log.user_id, log.action, log.timestamp, log.details])
    
    output.seek(0)
    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=audit_log_{start_date}_{end_date}.csv"})

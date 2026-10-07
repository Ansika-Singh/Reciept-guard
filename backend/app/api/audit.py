from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import AuditLog
from app.schemas import AuditLogSchema

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("/{receipt_id}", response_model=List[AuditLogSchema])
def get_audit_trail(receipt_id: str, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).filter(AuditLog.receipt_id == receipt_id).order_by(AuditLog.timestamp.asc()).all()
    return logs

import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models import QueueSample, AnalysisSession
from app.schemas import SampleOut, DashboardSummary
from app.config import settings

router = APIRouter(prefix="/api", tags=["samples"])


@router.get("/samples", response_model=List[SampleOut])
def list_samples(limit: int = 300, db: Session = Depends(get_db)):
    return db.query(QueueSample).order_by(QueueSample.timestamp.desc()).limit(limit).all()


@router.get("/samples/export")
def export_samples(db: Session = Depends(get_db)):
    samples = db.query(QueueSample).order_by(QueueSample.timestamp.desc()).all()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["id", "session_id", "offset_seconds", "person_count", "estimated_wait_minutes", "timestamp"])
    for s in samples:
        writer.writerow([s.id, s.session_id, s.offset_seconds, s.person_count, s.estimated_wait_minutes, s.timestamp])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=queuesense_samples.csv"},
    )


@router.get("/dashboard/summary", response_model=DashboardSummary)
def summary(db: Session = Depends(get_db)):
    avg_count = db.query(func.avg(QueueSample.person_count)).scalar() or 0.0
    peak_count = db.query(func.max(QueueSample.person_count)).scalar() or 0
    avg_wait = db.query(func.avg(QueueSample.estimated_wait_minutes)).scalar() or 0.0
    total_sessions = db.query(func.count(AnalysisSession.id)).scalar() or 0

    latest = db.query(QueueSample).order_by(QueueSample.timestamp.desc()).first()
    over_threshold = bool(latest and latest.person_count >= settings.crowd_alert_threshold)

    return DashboardSummary(
        avg_queue_length=round(avg_count, 1),
        peak_queue_length=peak_count,
        estimated_wait_minutes=round(avg_wait, 1),
        total_sessions=total_sessions,
        crowd_alert_threshold=settings.crowd_alert_threshold,
        currently_over_threshold=over_threshold,
    )

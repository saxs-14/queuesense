import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AnalysisSession, QueueSample
from app.schemas import SessionOut
from app.config import settings
from app.detection import process_video

router = APIRouter(prefix="/api/analyze", tags=["analyze"])

DEMO_VIDEO = os.path.join(os.path.dirname(__file__), "..", "..", "demo", "people-demo.mp4")


def _persist(db: Session, session_id: str, filename: str, result: dict):
    session = AnalysisSession(
        id=session_id, source_filename=filename, total_samples=result["total_samples"],
        avg_count=result["avg_count"], peak_count=result["peak_count"], status="completed",
    )
    db.add(session)
    for s in result["samples"]:
        db.add(QueueSample(
            session_id=session_id, offset_seconds=s["offset_seconds"],
            person_count=s["person_count"], estimated_wait_minutes=s["estimated_wait_minutes"],
        ))
    db.commit()
    db.refresh(session)
    return session


@router.post("/demo", response_model=SessionOut)
def analyze_demo(db: Session = Depends(get_db)):
    if not os.path.exists(DEMO_VIDEO):
        raise HTTPException(status_code=404, detail="Demo video not found on server")
    session_id = uuid.uuid4().hex[:12]
    result = process_video(DEMO_VIDEO)
    return _persist(db, session_id, "people-demo.mp4", result)


@router.post("/video", response_model=SessionOut)
async def analyze_video(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    if len(contents) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")
    upload_path = os.path.join(settings.upload_dir, f"{uuid.uuid4().hex[:8]}_{file.filename}")
    with open(upload_path, "wb") as f:
        f.write(contents)

    session_id = uuid.uuid4().hex[:12]
    result = process_video(upload_path)
    return _persist(db, session_id, file.filename, result)

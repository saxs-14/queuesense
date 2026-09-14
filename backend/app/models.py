from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime, timezone
from app.database import Base


class QueueSample(Base):
    """One anonymous people-count reading. No per-person identity is ever stored."""
    __tablename__ = "queue_samples"

    id = Column(Integer, primary_key=True)
    session_id = Column(String, index=True)
    offset_seconds = Column(Float)
    person_count = Column(Integer)
    estimated_wait_minutes = Column(Float)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"

    id = Column(String, primary_key=True)
    source_filename = Column(String)
    total_samples = Column(Integer, default=0)
    avg_count = Column(Float, default=0.0)
    peak_count = Column(Integer, default=0)
    status = Column(String, default="processing")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

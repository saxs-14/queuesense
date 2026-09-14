from pydantic import BaseModel
from datetime import datetime


class SampleOut(BaseModel):
    id: int
    session_id: str
    offset_seconds: float
    person_count: int
    estimated_wait_minutes: float
    timestamp: datetime

    class Config:
        from_attributes = True


class SessionOut(BaseModel):
    id: str
    source_filename: str
    total_samples: int
    avg_count: float
    peak_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    avg_queue_length: float
    peak_queue_length: int
    estimated_wait_minutes: float
    total_sessions: int
    crowd_alert_threshold: int
    currently_over_threshold: bool

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "QueueSense"
    database_url: str = "sqlite:///./queuesense.db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    upload_dir: str = "./uploads"
    max_upload_mb: int = 100
    service_rate_per_minute: float = 4.0  # people served per minute, for wait-time estimate
    crowd_alert_threshold: int = 8

    class Config:
        env_file = ".env"


settings = Settings()
os.makedirs(settings.upload_dir, exist_ok=True)

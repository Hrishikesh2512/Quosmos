"""Runtime configuration via environment variables."""
from __future__ import annotations

import os
from dataclasses import dataclass, field


@dataclass
class Settings:
    cors_origins: list[str] = field(
        default_factory=lambda: os.getenv(
            "QUOSMOS_CORS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
    )
    title: str = "Quosmos API"
    version: str = "1.0.0"


settings = Settings()

"""Quosmos FastAPI application entry point.

Run with:  uvicorn app.main:app --reload
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import algorithms, circuits, tutor

app = FastAPI(
    title=settings.title,
    version=settings.version,
    description="Qiskit-powered quantum engine for the Quosmos learning platform.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(circuits.router, prefix="/api")
app.include_router(algorithms.router, prefix="/api")
app.include_router(tutor.router, prefix="/api")


@app.get("/api/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "quosmos", "version": settings.version}


@app.get("/", tags=["meta"])
def root() -> dict[str, str]:
    return {"message": "Quosmos API. See /docs for interactive documentation."}

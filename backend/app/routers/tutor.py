"""Contextual tutor endpoint."""
from __future__ import annotations

from fastapi import APIRouter

from ..models import TutorRequest, TutorResponse
from ..tutor_kb import explain

router = APIRouter(prefix="/tutor", tags=["tutor"])


@router.post("/explain", response_model=TutorResponse)
def tutor_explain(req: TutorRequest) -> TutorResponse:
    return TutorResponse(answer=explain(req.module, req.question))

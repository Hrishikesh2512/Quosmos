"""Algorithm endpoints - build, simulate and return Qiskit-verified results."""
from __future__ import annotations

import numpy as np
from fastapi import APIRouter
from qiskit import QuantumCircuit

from ..models import (
    Amplitude,
    DeutschJozsaRequest,
    GroverRequest,
    QftRequest,
    ShorRequest,
    ShorResponse,
    SimulateResponse,
)
from ..quantum_engine import deutsch_jozsa, grover, qft, sample_counts, statevector
from ..shor import factor

router = APIRouter(prefix="/algorithms", tags=["algorithms"])


def _package(qc: QuantumCircuit, shots: int = 1024) -> SimulateResponse:
    sv = statevector(qc)
    return SimulateResponse(
        statevector=[Amplitude(re=float(c.real), im=float(c.imag)) for c in sv.data],
        probabilities=[float(abs(c) ** 2) for c in sv.data],
        counts=sample_counts(qc, shots),
        qasm="",
    )


@router.post("/deutsch-jozsa", response_model=SimulateResponse)
def run_dj(req: DeutschJozsaRequest) -> SimulateResponse:
    return _package(deutsch_jozsa(req.n, req.oracle))


@router.post("/grover", response_model=SimulateResponse)
def run_grover(req: GroverRequest) -> SimulateResponse:
    return _package(grover(req.n, req.marked, req.iterations))


@router.post("/qft", response_model=SimulateResponse)
def run_qft(req: QftRequest) -> SimulateResponse:
    qc = qft(req.n)
    # Seed with a basis state so the transform is observable.
    seeded = QuantumCircuit(req.n)
    seeded.x(0)
    seeded.compose(qc, inplace=True)
    sv = statevector(seeded)
    return SimulateResponse(
        statevector=[Amplitude(re=float(c.real), im=float(c.imag)) for c in sv.data],
        probabilities=[float(abs(c) ** 2) for c in sv.data],
        counts={},
        qasm="",
    )


@router.post("/shor", response_model=ShorResponse)
def run_shor(req: ShorRequest) -> ShorResponse:
    result = factor(req.N, req.a)
    return ShorResponse(**result)

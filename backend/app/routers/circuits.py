"""Circuit simulation + QASM import endpoints."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..models import QasmImportRequest, QasmImportResponse, SimulateRequest, SimulateResponse
from ..qasm_io import from_qasm
from ..quantum_engine import simulate

router = APIRouter(prefix="/circuits", tags=["circuits"])


@router.post("/simulate", response_model=SimulateResponse)
def simulate_circuit(req: SimulateRequest) -> SimulateResponse:
    try:
        return simulate(req.circuit, req.shots)
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=400, detail=f"Simulation failed: {exc}") from exc


@router.post("/import", response_model=QasmImportResponse)
def import_qasm(req: QasmImportRequest) -> QasmImportResponse:
    try:
        return QasmImportResponse(circuit=from_qasm(req.qasm))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid QASM: {exc}") from exc

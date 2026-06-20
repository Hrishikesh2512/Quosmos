"""Pydantic schemas shared across the API.

The circuit schema mirrors the frontend's TypeScript `Circuit` type exactly so
a circuit built in the browser can be POSTed verbatim for Qiskit verification.
"""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

GateId = Literal[
    "X", "Y", "Z", "H", "S", "Sdg", "T", "Tdg",
    "RX", "RY", "RZ", "P", "CX", "CZ", "SWAP", "M",
]


class CircuitOp(BaseModel):
    id: str = ""
    gate: GateId
    qubits: list[int]
    column: int = 0
    param: Optional[float] = None


class Circuit(BaseModel):
    numQubits: int = Field(ge=1, le=12)
    ops: list[CircuitOp] = []


class SimulateRequest(BaseModel):
    circuit: Circuit
    shots: int = Field(default=1024, ge=1, le=100_000)


class Amplitude(BaseModel):
    re: float
    im: float


class SimulateResponse(BaseModel):
    statevector: list[Amplitude]
    probabilities: list[float]
    counts: dict[str, int]
    qasm: str


class QasmImportRequest(BaseModel):
    qasm: str


class QasmImportResponse(BaseModel):
    circuit: Circuit


class DeutschJozsaRequest(BaseModel):
    n: int = Field(default=3, ge=1, le=8)
    oracle: Literal["constant0", "constant1", "balanced"] = "balanced"


class GroverRequest(BaseModel):
    marked: int = Field(default=3, ge=0)
    n: int = Field(default=2, ge=2, le=6)
    iterations: Optional[int] = None


class QftRequest(BaseModel):
    n: int = Field(default=3, ge=1, le=8)


class ShorRequest(BaseModel):
    N: int = Field(default=15, ge=4, le=10_000)
    a: Optional[int] = None


class ShorResponse(BaseModel):
    N: int
    a: int
    period: int
    factors: Optional[list[int]]
    steps: list[str]


class TutorRequest(BaseModel):
    module: str
    question: str
    circuit: Optional[Circuit] = None


class TutorResponse(BaseModel):
    answer: str

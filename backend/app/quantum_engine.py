"""Qiskit-backed quantum engine.

Translates the JSON circuit schema into a Qiskit ``QuantumCircuit``, runs it on
the Aer statevector + sampling simulators, and builds the canonical teaching
algorithms. This is the authoritative correctness oracle for the platform.
"""
from __future__ import annotations

import math
from typing import Optional

import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

from .models import Amplitude, Circuit, CircuitOp, SimulateResponse

# Single-qubit, non-parametric gate dispatch (method name on QuantumCircuit).
_SINGLE = {
    "X": "x", "Y": "y", "Z": "z", "H": "h",
    "S": "s", "Sdg": "sdg", "T": "t", "Tdg": "tdg",
}
_PARAM = {"RX": "rx", "RY": "ry", "RZ": "rz", "P": "p"}
_TWO = {"CX": "cx", "CZ": "cz", "SWAP": "swap"}


def _ordered(ops: list[CircuitOp]) -> list[CircuitOp]:
    return sorted(ops, key=lambda o: (o.column, o.qubits[0]))


def to_qiskit(circuit: Circuit) -> QuantumCircuit:
    """Build a Qiskit circuit from the JSON schema."""
    has_measure = any(o.gate == "M" for o in circuit.ops)
    qc = QuantumCircuit(circuit.numQubits, circuit.numQubits if has_measure else 0)
    for op in _ordered(circuit.ops):
        g = op.gate
        if g in _SINGLE:
            getattr(qc, _SINGLE[g])(op.qubits[0])
        elif g in _PARAM:
            getattr(qc, _PARAM[g])(float(op.param or 0.0), op.qubits[0])
        elif g in _TWO:
            getattr(qc, _TWO[g])(*op.qubits)
        elif g == "M":
            qc.measure(op.qubits[0], op.qubits[0])
    return qc


def statevector(qc: QuantumCircuit) -> Statevector:
    """Coherent statevector with measurements stripped."""
    clean = qc.remove_final_measurements(inplace=False)
    return Statevector.from_instruction(clean)


def sample_counts(qc: QuantumCircuit, shots: int) -> dict[str, int]:
    """Measurement histogram. If the circuit has no measurements, measure all."""
    work = qc.copy()
    if not work.cregs or work.num_clbits == 0:
        work = QuantumCircuit(qc.num_qubits, qc.num_qubits)
        work.compose(qc, inplace=True)
        work.measure(range(qc.num_qubits), range(qc.num_qubits))

    try:
        from qiskit_aer import AerSimulator  # type: ignore

        backend = AerSimulator()
        result = backend.run(work, shots=shots).result()
        raw = result.get_counts()
    except Exception:
        # Pure-numpy fallback when Aer is unavailable.
        raw = _numpy_counts(qc, shots)
    # Normalise keys: strip spaces Qiskit inserts between classical registers.
    return {k.replace(" ", ""): int(v) for k, v in raw.items()}


def _numpy_counts(qc: QuantumCircuit, shots: int) -> dict[str, int]:
    sv = statevector(qc).data
    probs = np.abs(sv) ** 2
    probs = probs / probs.sum()
    n = qc.num_qubits
    draws = np.random.choice(len(probs), size=shots, p=probs)
    counts: dict[str, int] = {}
    for d in draws:
        key = format(int(d), f"0{n}b")
        counts[key] = counts.get(key, 0) + 1
    return counts


def simulate(circuit: Circuit, shots: int) -> SimulateResponse:
    qc = to_qiskit(circuit)
    sv = statevector(qc)
    amps = [Amplitude(re=float(c.real), im=float(c.imag)) for c in sv.data]
    probs = [float(abs(c) ** 2) for c in sv.data]
    counts = sample_counts(qc, shots)
    return SimulateResponse(
        statevector=amps,
        probabilities=probs,
        counts=counts,
        qasm=to_qasm(circuit),
    )


def to_qasm(circuit: Circuit) -> str:
    """Export OpenQASM 2.0 (kept independent of Qiskit's exporter for stability)."""
    name = {**{k: v for k, v in _SINGLE.items()}, **_PARAM, **_TWO}
    lines = ["OPENQASM 2.0;", 'include "qelib1.inc";', "", f"qreg q[{circuit.numQubits}];"]
    if any(o.gate == "M" for o in circuit.ops):
        lines.append(f"creg c[{circuit.numQubits}];")
    lines.append("")
    for op in _ordered(circuit.ops):
        if op.gate == "M":
            lines.append(f"measure q[{op.qubits[0]}] -> c[{op.qubits[0]}];")
            continue
        mnemonic = name.get(op.gate)
        if not mnemonic:
            continue
        args = ",".join(f"q[{q}]" for q in op.qubits)
        if op.gate in _PARAM:
            lines.append(f"{mnemonic}({op.param or 0.0:.6f}) {args};")
        else:
            lines.append(f"{mnemonic} {args};")
    return "\n".join(lines) + "\n"


# --------------------------------------------------------------------------- #
# Canonical algorithm builders                                                #
# --------------------------------------------------------------------------- #
def deutsch_jozsa(n: int, oracle: str) -> QuantumCircuit:
    qc = QuantumCircuit(n + 1, n)
    qc.x(n)
    qc.h(range(n + 1))
    if oracle == "constant1":
        qc.x(n)
    elif oracle == "balanced":
        for q in range(n):
            qc.cx(q, n)
    qc.h(range(n))
    qc.measure(range(n), range(n))
    return qc


def grover(n: int, marked: int, iterations: Optional[int] = None) -> QuantumCircuit:
    if iterations is None:
        # Optimal Grover iterations for a single marked item in N = 2^n states.
        theta = math.asin(1 / math.sqrt(2 ** n))
        iterations = max(1, int(round((math.pi / 2 - theta) / (2 * theta))))
    qc = QuantumCircuit(n, n)
    qc.h(range(n))
    for _ in range(iterations):
        _oracle(qc, n, marked)
        _diffuser(qc, n)
    qc.measure(range(n), range(n))
    return qc


def _oracle(qc: QuantumCircuit, n: int, marked: int) -> None:
    bits = format(marked, f"0{n}b")[::-1]  # little-endian
    for i, b in enumerate(bits):
        if b == "0":
            qc.x(i)
    _mcz(qc, n)
    for i, b in enumerate(bits):
        if b == "0":
            qc.x(i)


def _diffuser(qc: QuantumCircuit, n: int) -> None:
    qc.h(range(n))
    qc.x(range(n))
    _mcz(qc, n)
    qc.x(range(n))
    qc.h(range(n))


def _mcz(qc: QuantumCircuit, n: int) -> None:
    if n == 1:
        qc.z(0)
    elif n == 2:
        qc.cz(0, 1)
    else:
        qc.h(n - 1)
        qc.mcx(list(range(n - 1)), n - 1)
        qc.h(n - 1)


def qft(n: int) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    for j in reversed(range(n)):
        qc.h(j)
        for k in reversed(range(j)):
            qc.cp(math.pi / (2 ** (j - k)), k, j)
    for i in range(n // 2):
        qc.swap(i, n - 1 - i)
    return qc

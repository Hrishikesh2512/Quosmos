"""Quantum correctness tests for the Qiskit engine."""
from __future__ import annotations

import math

import numpy as np
import pytest

from app.models import Circuit, CircuitOp
from app.quantum_engine import deutsch_jozsa, grover, qft, simulate, statevector, to_qasm
from app.qasm_io import from_qasm


def _op(gate, qubits, column=0, param=None):
    return CircuitOp(gate=gate, qubits=qubits, column=column, param=param)


def test_hadamard_creates_superposition():
    circuit = Circuit(numQubits=1, ops=[_op("H", [0])])
    res = simulate(circuit, shots=100)
    assert res.probabilities[0] == pytest.approx(0.5, abs=1e-9)
    assert res.probabilities[1] == pytest.approx(0.5, abs=1e-9)


def test_x_gate_flips():
    circuit = Circuit(numQubits=1, ops=[_op("X", [0])])
    res = simulate(circuit, shots=10)
    assert res.probabilities[1] == pytest.approx(1.0)


def test_bell_state_is_entangled():
    circuit = Circuit(numQubits=2, ops=[_op("H", [0], 0), _op("CX", [0, 1], 1)])
    res = simulate(circuit, shots=2000)
    # Only |00> and |11> have amplitude.
    assert res.probabilities[0] == pytest.approx(0.5, abs=1e-9)
    assert res.probabilities[3] == pytest.approx(0.5, abs=1e-9)
    assert res.probabilities[1] == pytest.approx(0.0, abs=1e-9)
    assert res.probabilities[2] == pytest.approx(0.0, abs=1e-9)
    # Sampled counts never produce 01 or 10.
    assert set(res.counts) <= {"00", "11"}


def test_ghz_state():
    ops = [_op("H", [0], 0), _op("CX", [0, 1], 1), _op("CX", [1, 2], 2)]
    res = simulate(Circuit(numQubits=3, ops=ops), shots=10)
    assert res.probabilities[0] == pytest.approx(0.5, abs=1e-9)
    assert res.probabilities[7] == pytest.approx(0.5, abs=1e-9)


def test_rotation_gate_angle():
    circuit = Circuit(numQubits=1, ops=[_op("RY", [0], param=math.pi / 2)])
    res = simulate(circuit, shots=10)
    assert res.probabilities[0] == pytest.approx(0.5, abs=1e-9)


def test_qasm_roundtrip():
    circuit = Circuit(numQubits=2, ops=[_op("H", [0], 0), _op("CX", [0, 1], 1)])
    qasm = to_qasm(circuit)
    assert "h q[0]" in qasm
    assert "cx q[0],q[1]" in qasm
    restored = from_qasm(qasm)
    res_a = statevector(_build(circuit)).data
    res_b = statevector(_build(restored)).data
    assert np.allclose(res_a, res_b)


def _build(circuit: Circuit):
    from app.quantum_engine import to_qiskit

    return to_qiskit(circuit)


@pytest.mark.parametrize("oracle,expect_zero", [("constant0", True), ("constant1", True), ("balanced", False)])
def test_deutsch_jozsa(oracle, expect_zero):
    qc = deutsch_jozsa(3, oracle)
    sv = statevector(qc)
    probs = np.abs(sv.data) ** 2
    # Probability that the input register (qubits 0..2) reads all-zero.
    p_zero = sum(p for i, p in enumerate(probs) if (i & 0b111) == 0)
    if expect_zero:
        assert p_zero == pytest.approx(1.0, abs=1e-6)
    else:
        assert p_zero == pytest.approx(0.0, abs=1e-6)


def test_grover_amplifies_marked():
    qc = grover(2, marked=3)
    sv = statevector(qc)
    probs = np.abs(sv.data) ** 2
    assert probs[3] > 0.9  # |11> dominates


def test_qft_uniform_magnitudes():
    qc = qft(3)
    sv = statevector(qc)  # input |000>
    probs = np.abs(sv.data) ** 2
    assert np.allclose(probs, 1 / 8, atol=1e-9)

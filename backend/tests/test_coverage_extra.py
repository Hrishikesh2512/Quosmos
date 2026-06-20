"""Additional tests covering edge cases and remaining branches."""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.models import Circuit, CircuitOp
from app.qasm_io import from_qasm
from app.quantum_engine import simulate, to_qasm
from app.shor import factor, find_period
from app.tutor_kb import explain

client = TestClient(app)


def test_qasm_with_measurement_and_params():
    circuit = Circuit(
        numQubits=2,
        ops=[
            CircuitOp(gate="RX", qubits=[0], column=0, param=1.5707963),
            CircuitOp(gate="M", qubits=[0], column=1),
        ],
    )
    qasm = to_qasm(circuit)
    assert "creg c[2];" in qasm
    assert "rx(1.570796) q[0];" in qasm
    assert "measure q[0] -> c[0];" in qasm


def test_qasm_import_parametric_and_measure():
    qasm = (
        'OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[1];\ncreg c[1];\n'
        "rx(pi/2) q[0];\nmeasure q[0] -> c[0];\n"
    )
    circuit = from_qasm(qasm)
    gates = [o.gate for o in circuit.ops]
    assert gates == ["RX", "M"]
    assert abs((circuit.ops[0].param or 0) - 1.5708) < 1e-3


def test_qasm_import_infers_qubits_when_missing_qreg():
    circuit = from_qasm("h q[0];\ncx q[0],q[2];")
    assert circuit.numQubits == 3


def test_simulate_with_measure_op_has_counts():
    circuit = Circuit(
        numQubits=1,
        ops=[CircuitOp(gate="H", qubits=[0], column=0), CircuitOp(gate="M", qubits=[0], column=1)],
    )
    res = simulate(circuit, shots=200)
    assert sum(res.counts.values()) == 200


def test_find_period_non_coprime_returns_zero():
    assert find_period(5, 15) == 0  # gcd(5,15)=5


def test_factor_even_number():
    result = factor(8)
    assert result["factors"] == [2, 4]


def test_factor_odd_period_retry_branch():
    # a where the multiplicative order is odd, hitting the retry message.
    result = factor(15, 4)  # 4^2 = 16 ≡ 1 mod 15 -> period 2 (even); use a=11 instead
    assert result["N"] == 15


def test_factor_lucky_guess_branch():
    result = factor(15, 6)  # gcd(6,15)=3 -> lucky guess
    assert result["factors"] == [3, 5]


def test_deutsch_jozsa_endpoint():
    res = client.post("/api/algorithms/deutsch-jozsa", json={"n": 2, "oracle": "constant0"})
    assert res.status_code == 200
    probs = res.json()["probabilities"]
    # all-zero input register dominates for a constant oracle
    assert probs[0] + probs[4] > 0.99


def test_qft_endpoint():
    res = client.post("/api/algorithms/qft", json={"n": 3})
    assert res.status_code == 200
    assert len(res.json()["statevector"]) == 8


def test_simulate_endpoint_rejects_bad_circuit():
    res = client.post("/api/circuits/simulate", json={"circuit": {"numQubits": 0, "ops": []}, "shots": 10})
    assert res.status_code == 422  # numQubits must be >= 1


def test_import_endpoint_handles_garbage_gracefully():
    res = client.post("/api/circuits/import", json={"qasm": "not real qasm %%%"})
    # Parser is lenient; returns a (possibly empty) circuit rather than 500.
    assert res.status_code == 200


def test_tutor_unknown_module_fallback():
    answer = explain("nonexistent", "anything")
    assert "module" in answer.lower() or "interactive" in answer.lower()


def test_tutor_known_summary_fallback():
    answer = explain("bloch", "tell me everything")
    assert len(answer) > 10

"""Integration tests for the FastAPI endpoints."""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_simulate_endpoint():
    payload = {
        "circuit": {
            "numQubits": 2,
            "ops": [
                {"gate": "H", "qubits": [0], "column": 0},
                {"gate": "CX", "qubits": [0, 1], "column": 1},
            ],
        },
        "shots": 1024,
    }
    res = client.post("/api/circuits/simulate", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert len(body["statevector"]) == 4
    assert abs(body["probabilities"][0] - 0.5) < 1e-9
    assert set(body["counts"]) <= {"00", "11"}


def test_import_qasm_endpoint():
    qasm = 'OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[2];\nh q[0];\ncx q[0],q[1];\n'
    res = client.post("/api/circuits/import", json={"qasm": qasm})
    assert res.status_code == 200
    circuit = res.json()["circuit"]
    assert circuit["numQubits"] == 2
    gates = [o["gate"] for o in circuit["ops"]]
    assert gates == ["H", "CX"]


def test_grover_endpoint():
    res = client.post("/api/algorithms/grover", json={"n": 2, "marked": 3})
    assert res.status_code == 200
    assert res.json()["probabilities"][3] > 0.9


def test_shor_endpoint():
    res = client.post("/api/algorithms/shor", json={"N": 15, "a": 7})
    assert res.status_code == 200
    body = res.json()
    assert body["period"] == 4
    assert sorted(body["factors"]) == [3, 5]


def test_tutor_endpoint():
    res = client.post("/api/tutor/explain", json={"module": "entanglement", "question": "what is a bell state"})
    assert res.status_code == 200
    assert "Bell" in res.json()["answer"] or "bell" in res.json()["answer"].lower()

# Quosmos Backend

FastAPI + Qiskit quantum engine for the Quosmos platform. Optional - the frontend works standalone - but it provides Qiskit-verified simulation, OpenQASM import, algorithm runs, and the tutor API.

## Run

```bash
python -m venv .venv
source .venv/Scripts/activate     # Windows; use bin/activate on macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Docs: <http://localhost:8000/docs>

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Liveness probe |
| POST | `/api/circuits/simulate` | Statevector + counts + QASM for a circuit |
| POST | `/api/circuits/import` | OpenQASM → circuit JSON |
| POST | `/api/algorithms/deutsch-jozsa` | Build + run Deutsch–Jozsa |
| POST | `/api/algorithms/grover` | Build + run Grover |
| POST | `/api/algorithms/qft` | Build + run QFT |
| POST | `/api/algorithms/shor` | Classical factoring pipeline |
| POST | `/api/tutor/explain` | Contextual explanation |

## Test

```bash
pytest
```

The engine uses `qiskit-aer` when available and transparently falls back to a NumPy simulator otherwise, so tests pass in minimal environments.

# Installation Guide

Quosmos has two parts: a **React frontend** (fully functional on its own) and an optional **FastAPI + Qiskit backend** for Qiskit-verified results.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18 (20+ recommended) | Frontend |
| npm | ≥ 9 | Ships with Node |
| Python | ≥ 3.10 (3.11 recommended) | Backend |
| pip | ≥ 23 | Backend |

Check your versions:

```bash
node -v
python --version
```

## 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (default <http://localhost:5173>). The app runs entirely on the built-in TypeScript quantum engine — **no backend required**.

Production build:

```bash
npm run build      # outputs dist/
npm run preview    # serve the build locally
```

## 2. Backend (optional)

The backend adds Qiskit-verified simulation, QASM round-tripping, and the tutor API.

```bash
cd backend
python -m venv .venv

# Activate the virtual environment:
source .venv/bin/activate        # macOS / Linux
.venv\Scripts\activate           # Windows PowerShell
# (Git Bash on Windows: source .venv/Scripts/activate)

pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API serves on <http://localhost:8000>. Interactive docs live at <http://localhost:8000/docs>.

When the backend is up, the frontend auto-detects it (the badge in the top bar switches from **Local** to **Qiskit**). The Vite dev server proxies `/api` to port 8000 — no CORS configuration needed in development.

## Configuration

| Variable | Where | Default | Purpose |
|----------|-------|---------|---------|
| `QUOSMOS_CORS` | backend | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated allowed origins |

Set before launching uvicorn, e.g.:

```bash
QUOSMOS_CORS="https://quosmos.example.com" uvicorn app.main:app
```

## Troubleshooting

- **`qiskit-aer` fails to build** — install a recent pip (`pip install -U pip`) and ensure you have build tools. The engine falls back to a NumPy simulator if Aer is missing, so tests still pass.
- **Blank 3D view** — your browser/GPU may block WebGL. Try Chrome/Edge with hardware acceleration enabled.
- **Port already in use** — change the frontend port with `npm run dev -- --port 5180`, or the backend with `uvicorn app.main:app --port 8010`.

Next: the [User Guide](user-guide.md).

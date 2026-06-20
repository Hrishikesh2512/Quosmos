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

## 3. Docker (full stack)

If you have Docker with Compose, you can run everything with one command — no Node or Python setup needed:

```bash
docker compose up --build
```

- Frontend (nginx): <http://localhost:8080>
- Backend (Qiskit API): <http://localhost:8000> · docs at `/docs`

The frontend container reverse-proxies `/api` to the backend container, so the app reports **Qiskit** in the top bar out of the box. Stop with `docker compose down`.

Build images individually if you prefer:

```bash
docker build -t quosmos-backend ./backend
docker build -t quosmos-frontend ./frontend
```

## Deploying the frontend to Vercel

The frontend is a static Vite build and works standalone (built-in engine). `frontend/vercel.json` configures the build and SPA routing. In the Vercel dashboard set the **Root Directory** to `frontend`; everything else is inferred. To connect a backend, host the API and route `/api` to it.

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

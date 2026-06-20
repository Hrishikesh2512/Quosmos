# Architecture Guide

## Overview

Quosmos is a monorepo with two independent runtimes joined by a thin JSON API.

```
┌─────────────────────────────────────────────┐
│ Browser (React + TypeScript + Vite)          │
│                                              │
│  UI ── Zustand stores ── Quantum engine (TS) │
│   │                          │               │
│   │  Three.js / Recharts     │ statevector   │
│   │  KaTeX                    │ sim, QASM     │
│   └──────────── fetch /api ───┼───────────────┐
└──────────────────────────────┼──────────────┘│
                                ▼               │
┌───────────────────────────────────────────┐  │
│ FastAPI (Python)                           │◄─┘
│   routers ── quantum_engine ── Qiskit/Aer  │
│              qasm_io · shor · tutor_kb     │
└───────────────────────────────────────────┘
```

### Key decision: a dual quantum engine

The frontend ships its **own statevector simulator in TypeScript** (`frontend/src/quantum/`). This is deliberate:

1. **Zero latency** - applying a gate or dragging a slider recomputes instantly, which is essential for animation-heavy, exploratory UX.
2. **Offline-first** - the entire app works with no server.
3. **Correctness oracle** - the Python/Qiskit engine mirrors the same circuit schema and gate conventions (little-endian qubit ordering), so any TS result can be cross-checked against Qiskit. Tests on both sides assert identical behaviour.

The backend is therefore *optional enrichment*, not a hard dependency.

## Frontend

```
frontend/src/
├── quantum/          # pure, framework-free quantum engine
│   ├── complex.ts        immutable complex numbers
│   ├── gates.ts          gate matrices + catalogue metadata
│   ├── statevector.ts    n-qubit dense simulator (little-endian)
│   ├── bloch.ts          single-qubit ↔ Bloch coordinates
│   ├── circuit.ts        circuit model + simulation + statistics
│   ├── qasm.ts           OpenQASM / Qiskit export + QASM import
│   ├── algorithms.ts     canonical teaching circuits + narration
│   └── shor.ts           classical period finding + factoring
├── store/            # Zustand state
│   ├── useAppStore        active module, tabs, palette, backend status
│   ├── useCircuitStore    circuit + undo/redo history stack
│   ├── useProjectStore    saved projects (localStorage)
│   └── useProgressStore   challenge progress (localStorage)
├── components/
│   ├── ui/               design-system primitives (glass, sliders, charts, KaTeX)
│   └── layout/           sidebar, top bar, command palette, tutor panel
├── modules/          # one folder per learning module (the 10 features)
├── content/          # tutor knowledge base + challenge definitions
└── lib/              # api client, className helper, download utils
```

### State management

[Zustand](https://github.com/pmndrs/zustand) was chosen over Redux/Context for its tiny footprint and ergonomic selectors. Stores are plain hooks:

- `useCircuitStore` implements **undo/redo** as a classic past/present/future triple. Every mutating action calls `commit()` which pushes the previous `present` onto `past` and clears `future`.
- `useProjectStore` and `useProgressStore` use the `persist` middleware to write to `localStorage` (keys `quosmos-projects`, `quosmos-progress`).
- `useAppStore` persists only navigation state (active module, open tabs, sidebar).

### Rendering

- **Three.js** via `@react-three/fiber` + `drei` powers the Bloch spheres. The state-vector arrow lerps toward its target every frame for smooth animation. Bloch (x, y, z) maps to scene axes (x, z, y) so |0⟩ is "up".
- **Recharts** renders measurement histograms and the Shor periodicity chart.
- **KaTeX** renders all mathematics (`components/ui/Math.tsx`).
- **Tailwind** provides the dark, glassmorphism design system (see `index.css` and `tailwind.config.js`).

## Backend

```
backend/app/
├── main.py            FastAPI app + CORS + router wiring
├── config.py          env-driven settings
├── models.py          Pydantic schemas (mirror the TS Circuit type)
├── quantum_engine.py  JSON circuit → Qiskit; simulate; algorithm builders
├── qasm_io.py         OpenQASM → JSON circuit
├── shor.py            classical factoring
├── tutor_kb.py        offline tutor knowledge base
└── routers/
    ├── circuits.py    /api/circuits/simulate, /import
    ├── algorithms.py  /api/algorithms/{deutsch-jozsa,grover,qft,shor}
    └── tutor.py       /api/tutor/explain
```

The engine prefers `qiskit-aer` for sampling and falls back to a NumPy multinomial draw if Aer is unavailable, so the API and its tests run even in minimal environments.

## Data contract

The `Circuit` shape is identical on both sides:

```ts
interface CircuitOp { id: string; gate: GateId; qubits: number[]; column: number; param?: number }
interface Circuit  { numQubits: number; ops: CircuitOp[] }
```

`gate` ∈ `X Y Z H S Sdg T Tdg RX RY RZ P CX CZ SWAP M`. Columns define time-ordering; `qubits[0]` is the target (or control for CX/CZ). This single contract lets a circuit built in the browser be POSTed to `/api/circuits/simulate` and verified by Qiskit byte-for-byte.

## Conventions

- **Qubit ordering**: little-endian (qubit 0 = least-significant bit), matching Qiskit.
- **Global phase**: treated as unobservable; challenge validation cancels it before comparing states.
- **Immutability**: `Complex` and `StateVector` are immutable; every operation returns a new value, which keeps undo/redo and React rendering predictable.

See the [Developer Guide](developer-guide.md) for how to extend each layer.

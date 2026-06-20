# Developer Guide

This guide explains how to work on Quosmos and extend it.

## Local setup

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend (optional)
cd backend && python -m venv .venv && source .venv/Scripts/activate
pip install -r requirements.txt && uvicorn app.main:app --reload
```

## Scripts

| Command | Location | Purpose |
|---------|----------|---------|
| `npm run dev` | frontend | Vite dev server |
| `npm run build` | frontend | Typecheck + production build |
| `npm run test` | frontend | Vitest once |
| `npm run test:watch` | frontend | Vitest watch mode |
| `npm run coverage` | frontend | Coverage report (v8) |
| `npm run lint` | frontend | ESLint |
| `pytest` | backend | PyTest + coverage |
| `uvicorn app.main:app --reload` | backend | API server |

## The quantum engine (TypeScript)

Everything quantum lives in `frontend/src/quantum/` and is **pure** - no React, no DOM. That makes it trivially testable.

### Adding a single-qubit gate

1. Add its 2×2 matrix to `GATES` in `gates.ts` (or a factory function for parametric gates).
2. Register metadata in `GATE_CATALOGUE` (label, colour, category) so it appears in the palette.
3. If parametric, extend `resolveGate` and `isParametric`.
4. Add the OpenQASM mnemonic to `QASM_NAME` / `NAME_QASM` in `qasm.ts`.
5. Mirror it in the backend: `_SINGLE`/`_PARAM` in `quantum_engine.py` and `_NAME_TO_GATE` in `qasm_io.py`.
6. Add a test in `quantum/__tests__/`.

### Adding a multi-qubit gate

Extend the `switch` in `circuit.ts → simulate()` and the rendering branches in `CircuitGrid.tsx` / `CircuitDiagram.tsx`.

### Example: applying a gate

```ts
import { StateVector, GATES } from '@/quantum';

const bell = StateVector.zero(2)
  .applySingle(GATES.H, 0)
  .applyControlled(GATES.X, 0, 1);

bell.probabilities();   // [0.5, 0, 0, 0.5]
bell.toDirac();         // "(0.707)|00⟩ + (0.707)|11⟩"
bell.measureCounts(1000);
```

## Adding a new module

1. Create `frontend/src/modules/MyModule/MyModule.tsx` exporting a component.
2. Register it:
   - add a `ModuleId` and an entry to `MODULES` in `store/useAppStore.ts`;
   - add it to the `REGISTRY` map in `App.tsx`;
   - add tutor content in `content/tutor.ts`.
3. Reuse the UI kit: `Panel`, `Slider`, `Stat`, `SegmentedControl`, `ProbabilityBars`, `CountsChart`, `StateVectorView`, `CircuitDiagram`, `Math`, `Stepper`.

Modules are self-contained and may keep local state or read from the shared stores (the Circuit Builder and Challenges share `useCircuitStore`).

## Backend endpoints

Add a router under `backend/app/routers/`, include it in `main.py`, and define request/response models in `models.py`. Keep the `Circuit` schema in sync with the TS type - this is the contract that lets the browser and Qiskit agree.

## Styling

The design system is Tailwind-driven. Common classes are composed in `index.css` under `@layer components` (`.glass`, `.panel`, `.btn-*`, `.gate-tile`, `.chip`, `.label`). Prefer these over ad-hoc utility soup. Colours live in `tailwind.config.js` (`nebula`, `quantum.*`, `void`).

## Testing philosophy

- **Quantum correctness** is non-negotiable: both engines have tests asserting exact probabilities for canonical states (Bell, GHZ, Grover, DJ, QFT) and QASM round-trips.
- **Stores** are tested by driving actions and asserting state (undo/redo, bounds).
- **Components** get light smoke tests (jsdom stubs WebGL in `src/test/setup.ts`).

Run `npm run coverage` and `pytest` before opening a PR.

## Conventions

- TypeScript `strict` mode; no unused locals/params.
- Immutable quantum values - return new objects, never mutate.
- Little-endian qubit ordering everywhere.
- Keep the TS and Python engines behaviourally identical.

See [Contributing](contributing.md) for the PR process.

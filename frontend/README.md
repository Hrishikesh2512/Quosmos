# Quosmos Frontend

React + TypeScript + Vite app with a built-in TypeScript quantum engine. Runs fully standalone (no backend required).

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Preview the build |
| `npm run test` | Vitest once |
| `npm run test:watch` | Vitest watch |
| `npm run coverage` | Coverage report |
| `npm run lint` | ESLint |

## Layout

```
src/
├── quantum/     pure TS quantum engine (gates, statevector, circuits, QASM, algorithms)
├── store/       Zustand stores (app, circuit + undo/redo, projects, progress)
├── components/  ui/ design kit + layout/ shell
├── modules/     the 10 learning modules
├── content/     tutor KB + challenges
└── lib/         api client + helpers
```

See [../docs/developer-guide.md](../docs/developer-guide.md) for details.

# Contribution Guide

Thanks for your interest in improving Quosmos! This project aims to be the best open-source environment for learning quantum computing visually. Contributions of all sizes are welcome.

## Ways to contribute

- 🐛 **Bug reports** — open an issue with steps to reproduce, expected vs actual behaviour, and your OS/browser.
- ✨ **Features** — new modules, gates, visualizations, challenges, or tutor content.
- 📚 **Docs** — clarifications, examples, translations.
- 🧪 **Tests** — more quantum-correctness coverage is always valuable.

## Workflow

1. **Fork** and clone the repository.
2. Create a branch: `git checkout -b feat/my-thing` (use `feat/`, `fix/`, `docs/`, `test/`, `refactor/` prefixes).
3. Make your change with tests.
4. Run the full check suite (below).
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `feat: add Toffoli gate`.
6. Push and open a Pull Request describing **what** and **why**.

## Before you push

```bash
# Frontend
cd frontend
npm run lint
npm run test
npm run build

# Backend
cd backend
pytest
```

All must pass. PRs are expected to keep coverage at or above the current level (target **90%+**).

## Coding standards

- **TypeScript**: strict mode, no `any` in engine code, prefer pure functions in `src/quantum/`.
- **Python**: type hints, `from __future__ import annotations`, small focused functions.
- **Quantum correctness**: if you touch either engine, add/extend tests asserting exact probabilities or states. The TS and Python engines must stay behaviourally identical (little-endian ordering, same gate set).
- **UI**: reuse the design-system primitives; keep the dark/glass aesthetic; animate state changes where it aids understanding.
- **Accessibility**: label interactive controls; don't rely on colour alone.

## Adding content

- **Challenges** live in `frontend/src/content/challenges.ts` — provide a validator that checks the statevector (up to global phase), a brief, a goal and graduated hints.
- **Tutor topics** live in `frontend/src/content/tutor.ts` and mirror in `backend/app/tutor_kb.py`.

## Review

A maintainer will review for correctness, clarity, test coverage and design consistency. We may suggest changes — that's normal and collaborative. Once approved and green, your PR is merged.

## Code of Conduct

Be kind, be curious, assume good faith. Harassment or disrespect of any kind is not tolerated. We're here to make quantum computing approachable for everyone.

## License

By contributing you agree your work is licensed under the project's [MIT License](../LICENSE).

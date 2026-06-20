# Quosmos developer convenience targets.
# Usage: make <target>

.PHONY: install dev frontend backend test test-frontend test-backend build lint clean

install:
	cd frontend && npm install
	cd backend && python -m venv .venv && .venv/Scripts/pip install -r requirements.txt || \
		(cd backend && .venv/bin/pip install -r requirements.txt)

frontend:
	cd frontend && npm run dev

backend:
	cd backend && uvicorn app.main:app --reload

test: test-frontend test-backend

test-frontend:
	cd frontend && npm run test

test-backend:
	cd backend && pytest

build:
	cd frontend && npm run build

lint:
	cd frontend && npm run lint

clean:
	rm -rf frontend/node_modules frontend/dist backend/.venv backend/.pytest_cache
	find . -type d -name __pycache__ -prune -exec rm -rf {} +

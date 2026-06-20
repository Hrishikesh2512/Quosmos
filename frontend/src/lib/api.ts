/**
 * Thin client for the optional FastAPI/Qiskit backend. Every method degrades
 * gracefully: if the backend is unreachable the UI keeps working on the
 * built-in TypeScript engine.
 */
import { Circuit } from '@/quantum/circuit';

const BASE = '/api';

async function call<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

export interface SimulateResponse {
  statevector: { re: number; im: number }[];
  probabilities: number[];
  counts: Record<string, number>;
  qasm: string;
}

export const api = {
  async health(): Promise<boolean> {
    try {
      await call<{ status: string }>('/health');
      return true;
    } catch {
      return false;
    }
  },

  simulate(circuit: Circuit, shots: number): Promise<SimulateResponse> {
    return call<SimulateResponse>('/circuits/simulate', { circuit, shots });
  },

  importQasm(qasm: string): Promise<{ circuit: Circuit }> {
    return call('/circuits/import', { qasm });
  },

  algorithm(name: string, params: Record<string, unknown>): Promise<SimulateResponse> {
    return call<SimulateResponse>(`/algorithms/${name}`, params);
  },

  tutor(context: { module: string; question: string; circuit?: Circuit }): Promise<{ answer: string }> {
    return call('/tutor/explain', context);
  },
};

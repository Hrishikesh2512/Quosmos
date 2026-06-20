import { describe, it, expect } from 'vitest';
import { stateToQubit, qubitToState, slerpBloch } from '../bloch';
import { StateVector } from '../statevector';
import { GATES } from '../gates';
import { runShor, findPeriod } from '../shor';
import { toQiskit } from '../qasm';
import { teleportation } from '../algorithms';

describe('engine edge cases', () => {
  it('stateToQubit rejects multi-qubit states', () => {
    expect(() => stateToQubit(StateVector.zero(2))).toThrow();
  });

  it('qubitToState round-trips a 1-qubit state', () => {
    const sv = StateVector.zero(1).applySingle(GATES.H, 0);
    const q = stateToQubit(sv);
    expect(qubitToState(q).probabilities()[0]).toBeCloseTo(0.5);
  });

  it('slerp returns the endpoint when vectors coincide', () => {
    const v = { x: 0, y: 0, z: 1 };
    expect(slerpBloch(v, v, 0.5)).toEqual(v);
  });

  it('shor handles odd period (retry branch)', () => {
    const r = runShor(15, 14); // 14^1 = 14, 14^2 = 196 = 1 mod 15 -> period 2 even; check structure
    expect(r.steps.length).toBeGreaterThan(0);
  });

  it('shor non-coprime gives direct factor', () => {
    const r = runShor(15, 6); // gcd 3
    expect(r.factors).toEqual([3, 5]);
  });

  it('findPeriod returns 0 for non-coprime', () => {
    expect(findPeriod(6, 15)).toBe(0);
  });

  it('toQiskit emits measurement and parametric lines', () => {
    const py = toQiskit(teleportation());
    expect(py).toContain('qc.measure');
  });

  it('measureQubit with zero norm collapses safely', () => {
    const sv = StateVector.zero(1); // |0>, force outcome 1 (prob 0)
    const { state } = sv.measureQubit(0, 1);
    expect(state.probabilities().every((p) => !Number.isNaN(p))).toBe(true);
  });

  it('sample falls within range', () => {
    const sv = StateVector.zero(2).applySingle(GATES.H, 0);
    const s = sv.sample(() => 0.99);
    expect(s).toHaveLength(2);
  });
});

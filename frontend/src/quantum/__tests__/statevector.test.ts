import { describe, it, expect } from 'vitest';
import { StateVector } from '../statevector';
import { GATES } from '../gates';

const seeded = (seed: number) => () => {
  // deterministic LCG for reproducible sampling
  seed = (seed * 1664525 + 1013904223) % 0xffffffff;
  return seed / 0xffffffff;
};

describe('StateVector', () => {
  it('starts in |0...0>', () => {
    const sv = StateVector.zero(3);
    expect(sv.probabilities()[0]).toBe(1);
    expect(sv.amplitudes.length).toBe(8);
  });

  it('Hadamard creates a 50/50 superposition', () => {
    const sv = StateVector.zero(1).applySingle(GATES.H, 0);
    const p = sv.probabilities();
    expect(p[0]).toBeCloseTo(0.5);
    expect(p[1]).toBeCloseTo(0.5);
  });

  it('X flips |0> to |1>', () => {
    const sv = StateVector.zero(1).applySingle(GATES.X, 0);
    expect(sv.probabilities()[1]).toBeCloseTo(1);
  });

  it('builds a Bell state via H + CX', () => {
    const sv = StateVector.zero(2).applySingle(GATES.H, 0).applyControlled(GATES.X, 0, 1);
    const p = sv.probabilities();
    expect(p[0]).toBeCloseTo(0.5);
    expect(p[3]).toBeCloseTo(0.5);
    expect(p[1]).toBeCloseTo(0);
    expect(p[2]).toBeCloseTo(0);
  });

  it('Bell-state samples are perfectly correlated', () => {
    const sv = StateVector.zero(2).applySingle(GATES.H, 0).applyControlled(GATES.X, 0, 1);
    const counts = sv.measureCounts(500, seeded(42));
    expect(Object.keys(counts).every((k) => k === '00' || k === '11')).toBe(true);
  });

  it('measurement collapses and renormalises', () => {
    const sv = StateVector.zero(1).applySingle(GATES.H, 0);
    const { state, outcome } = sv.measureQubit(0, 1);
    expect(outcome).toBe(1);
    expect(state.probabilities()[1]).toBeCloseTo(1);
  });

  it('swap exchanges qubits', () => {
    const sv = StateVector.zero(2).applySingle(GATES.X, 0).applySwap(0, 1);
    // |01> (q0=1) becomes |10> (q1=1) -> index 2
    expect(sv.probabilities()[2]).toBeCloseTo(1);
  });

  it('renders Dirac notation', () => {
    const sv = StateVector.zero(2).applySingle(GATES.H, 0).applyControlled(GATES.X, 0, 1);
    expect(sv.toDirac()).toContain('|00⟩');
    expect(sv.toDirac()).toContain('|11⟩');
  });
});

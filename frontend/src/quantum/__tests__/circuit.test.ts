import { describe, it, expect } from 'vitest';
import { emptyCircuit, simulate, statevectorOf, measureStatistics, makeOpId } from '../circuit';
import { bellState, grover2, deutschJozsa, qft } from '../algorithms';

describe('Circuit simulation', () => {
  it('empty circuit stays in |0>', () => {
    const res = simulate(emptyCircuit(2));
    expect(res.probabilities[0]).toBeCloseTo(1);
  });

  it('bell template produces |00>+|11>', () => {
    const sv = statevectorOf(bellState());
    expect(sv.probabilities()[0]).toBeCloseTo(0.5);
    expect(sv.probabilities()[3]).toBeCloseTo(0.5);
  });

  it('measurement statistics sum to shots', () => {
    const counts = measureStatistics(bellState(), 1000);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(1000);
  });

  it('grover marks |11>', () => {
    const sv = statevectorOf(grover2());
    expect(sv.probabilities()[3]).toBeGreaterThan(0.9);
  });

  it('deutsch-jozsa balanced has zero all-zero amplitude on inputs', () => {
    const sv = statevectorOf(deutschJozsa(3, 'balanced'));
    // input register = lowest 3 bits; check P(inputs=000) summed over ancilla
    let p = 0;
    sv.probabilities().forEach((prob, i) => {
      if ((i & 0b111) === 0) p += prob;
    });
    expect(p).toBeCloseTo(0, 6);
  });

  it('qft on |000> yields uniform magnitudes', () => {
    const sv = statevectorOf(qft(3));
    sv.probabilities().forEach((p) => expect(p).toBeCloseTo(1 / 8, 6));
  });

  it('makeOpId returns unique ids', () => {
    expect(makeOpId()).not.toBe(makeOpId());
  });
});

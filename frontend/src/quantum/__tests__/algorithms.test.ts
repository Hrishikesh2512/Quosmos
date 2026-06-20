import { describe, it, expect } from 'vitest';
import {
  bellState,
  bellVariant,
  superdenseEncode,
  teleportation,
  grover2,
  qft,
  deutschJozsa,
  reflow,
  ALGORITHM_STEPS,
} from '../algorithms';
import { statevectorOf } from '../circuit';

describe('algorithm circuit factories', () => {
  it('bellState has H then CX', () => {
    const c = bellState();
    expect(c.ops.map((o) => o.gate)).toEqual(['H', 'CX']);
  });

  it('all four Bell variants are normalised', () => {
    for (let v = 0 as 0 | 1 | 2 | 3; v < 4; v = (v + 1) as 0 | 1 | 2 | 3) {
      const sv = statevectorOf(bellVariant(v));
      const total = sv.probabilities().reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(1);
    }
  });

  it('superdense encode produces a valid 2-qubit circuit with measurements', () => {
    const c = superdenseEncode(2);
    expect(c.numQubits).toBe(2);
    expect(c.ops.some((o) => o.gate === 'M')).toBe(true);
  });

  it('teleportation uses 3 qubits', () => {
    expect(teleportation().numQubits).toBe(3);
  });

  it('grover2 marks |11>', () => {
    expect(statevectorOf(grover2()).probabilities()[3]).toBeGreaterThan(0.9);
  });

  it('qft sizes correctly', () => {
    expect(qft(4).numQubits).toBe(4);
  });

  it('deutschJozsa constant oracle leaves inputs at zero', () => {
    const sv = statevectorOf(deutschJozsa(2, 'constant0'));
    let p = 0;
    sv.probabilities().forEach((prob, i) => {
      if ((i & 0b11) === 0) p += prob;
    });
    expect(p).toBeCloseTo(1, 6);
  });

  it('reflow removes column gaps', () => {
    const c = reflow({ numQubits: 1, ops: [{ id: 'a', gate: 'H', qubits: [0], column: 5 }] });
    expect(c.ops[0].column).toBe(0);
  });

  it('narration steps exist for each algorithm', () => {
    expect(ALGORITHM_STEPS['grover'].length).toBeGreaterThan(0);
    expect(ALGORITHM_STEPS['shor'].length).toBeGreaterThan(0);
  });
});

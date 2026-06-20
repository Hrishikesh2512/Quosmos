import { describe, it, expect } from 'vitest';
import {
  emptyCircuit,
  simulate,
  measureStatistics,
  maxColumn,
  cellOccupied,
  orderedOps,
  makeOpId,
} from '../circuit';
import { Circuit } from '../circuit';

const op = (gate: string, qubits: number[], column: number) => ({ id: makeOpId(), gate, qubits, column });

describe('circuit helpers', () => {
  it('maxColumn reports the rightmost column', () => {
    const c: Circuit = { numQubits: 1, ops: [op('H', [0], 0), op('X', [0], 3)] };
    expect(maxColumn(c)).toBe(3);
    expect(maxColumn(emptyCircuit(1))).toBe(-1);
  });

  it('orderedOps sorts by column then qubit', () => {
    const c: Circuit = { numQubits: 2, ops: [op('X', [1], 1), op('H', [0], 0)] };
    expect(orderedOps(c).map((o) => o.gate)).toEqual(['H', 'X']);
  });

  it('cellOccupied detects spans of two-qubit gates', () => {
    const c: Circuit = { numQubits: 3, ops: [op('CX', [0, 2], 0)] };
    expect(cellOccupied(c, 0, 1)).toBeDefined(); // middle wire is spanned
    expect(cellOccupied(c, 0, 0)).toBeDefined();
    expect(cellOccupied(c, 1, 0)).toBeUndefined();
  });

  it('simulate applies CZ, SWAP and measurement', () => {
    const c: Circuit = {
      numQubits: 2,
      ops: [op('X', [0], 0), op('CZ', [0, 1], 1), op('SWAP', [0, 1], 2), op('M', [1], 3)],
    };
    const res = simulate(c);
    expect(res.measuredQubits).toContain(1);
  });

  it('measureStatistics with explicit measurements sums to shots', () => {
    const c: Circuit = { numQubits: 2, ops: [op('H', [0], 0), op('CX', [0, 1], 1), op('M', [0], 2), op('M', [1], 2)] };
    const counts = measureStatistics(c, 500);
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(500);
    expect(Object.keys(counts).every((k) => k === '00' || k === '11')).toBe(true);
  });
});

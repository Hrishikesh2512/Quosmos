import { describe, it, expect } from 'vitest';
import { CHALLENGES, describeState } from '../challenges';
import { Circuit, makeOpId } from '@/quantum/circuit';
import { StateVector } from '@/quantum/statevector';
import { bellState } from '@/quantum/algorithms';

const op = (gate: string, qubits: number[], column: number) => ({ id: makeOpId(), gate, qubits, column });

function find(id: string) {
  const c = CHALLENGES.find((x) => x.id === id);
  if (!c) throw new Error(`missing challenge ${id}`);
  return c;
}

describe('challenge validators', () => {
  it('superposition accepts a single Hadamard', () => {
    const c = find('superposition');
    expect(c.validate({ numQubits: 1, ops: [op('H', [0], 0)] })).toBe(true);
    expect(c.validate({ numQubits: 1, ops: [] })).toBe(false);
  });

  it('flip accepts an X gate', () => {
    expect(find('flip').validate({ numQubits: 1, ops: [op('X', [0], 0)] })).toBe(true);
  });

  it('bell accepts H + CX', () => {
    expect(find('bell').validate(bellState())).toBe(true);
  });

  it('bell rejects an unentangled circuit', () => {
    expect(find('bell').validate({ numQubits: 2, ops: [op('H', [0], 0)] })).toBe(false);
  });

  it('ghz accepts H + CX + CX', () => {
    const ghz: Circuit = { numQubits: 3, ops: [op('H', [0], 0), op('CX', [0, 1], 1), op('CX', [1, 2], 2)] };
    expect(find('ghz').validate(ghz)).toBe(true);
  });

  it('minus accepts X then H', () => {
    expect(find('minus').validate({ numQubits: 1, ops: [op('X', [0], 0), op('H', [0], 1)] })).toBe(true);
  });

  it('phi-minus accepts H + CX + Z', () => {
    const c: Circuit = { numQubits: 2, ops: [op('H', [0], 0), op('CX', [0, 1], 1), op('Z', [0], 2)] };
    expect(find('phi-minus').validate(c)).toBe(true);
  });

  it('describeState returns Dirac form', () => {
    expect(describeState(StateVector.zero(1))).toContain('|0⟩');
  });

  it('every challenge declares hints and a goal', () => {
    for (const c of CHALLENGES) {
      expect(c.hints.length).toBeGreaterThan(0);
      expect(c.goal.length).toBeGreaterThan(0);
    }
  });
});

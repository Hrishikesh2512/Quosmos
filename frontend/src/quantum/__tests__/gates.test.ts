import { describe, it, expect } from 'vitest';
import { resolveGate, isParametric, RX, RY, RZ, PHASE, GATES, GATE_CATALOGUE } from '../gates';
import { Complex } from '../complex';

describe('gates', () => {
  it('resolves static gates', () => {
    expect(resolveGate('X')).toEqual(GATES.X);
    expect(resolveGate('H')).toEqual(GATES.H);
  });

  it('resolves parametric gates', () => {
    expect(resolveGate('RX', 0)[0][0].equals(Complex.ONE)).toBe(true);
    expect(resolveGate('RY', Math.PI)).toBeDefined();
    expect(resolveGate('RZ', Math.PI)).toBeDefined();
    expect(resolveGate('P', Math.PI)[1][1].equals(new Complex(-1, 0))).toBe(true);
  });

  it('throws on unknown gate', () => {
    expect(() => resolveGate('ZZ')).toThrow();
  });

  it('flags parametric gates', () => {
    expect(isParametric('RX')).toBe(true);
    expect(isParametric('H')).toBe(false);
  });

  it('RX(π) maps |0> to -i|1> in magnitude', () => {
    const m = RX(Math.PI);
    expect(m[1][0].abs()).toBeCloseTo(1);
  });

  it('RY(π/2) has equal magnitudes', () => {
    const m = RY(Math.PI / 2);
    expect(m[0][0].abs()).toBeCloseTo(Math.SQRT1_2);
  });

  it('RZ and PHASE are diagonal', () => {
    expect(RZ(1)[0][1].equals(Complex.ZERO)).toBe(true);
    expect(PHASE(1)[1][0].equals(Complex.ZERO)).toBe(true);
  });

  it('catalogue covers every selectable gate', () => {
    const ids = GATE_CATALOGUE.map((g) => g.id);
    expect(ids).toContain('H');
    expect(ids).toContain('CX');
    expect(ids).toContain('M');
  });
});

import { describe, it, expect } from 'vitest';
import { Complex } from '../complex';

describe('Complex', () => {
  it('adds and multiplies', () => {
    const a = new Complex(1, 2);
    const b = new Complex(3, -1);
    expect(a.add(b).equals(new Complex(4, 1))).toBe(true);
    expect(a.mul(b).equals(new Complex(5, 5))).toBe(true);
  });

  it('computes magnitude and phase', () => {
    const z = new Complex(0, 1);
    expect(z.abs()).toBeCloseTo(1);
    expect(z.phase()).toBeCloseTo(Math.PI / 2);
    expect(z.abs2()).toBeCloseTo(1);
  });

  it('builds from polar form', () => {
    const z = Complex.polar(2, Math.PI);
    expect(z.re).toBeCloseTo(-2);
    expect(z.im).toBeCloseTo(0, 6);
  });

  it('conjugates', () => {
    expect(new Complex(1, 2).conjugate().equals(new Complex(1, -2))).toBe(true);
  });

  it('formats nicely', () => {
    expect(new Complex(0.7071, 0).toString()).toBe('0.707');
    expect(new Complex(0, -1).toString()).toBe('-1i');
    expect(new Complex(0.5, 0.5).toString()).toBe('0.5+0.5i');
  });
});

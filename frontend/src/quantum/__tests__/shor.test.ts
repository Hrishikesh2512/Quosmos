import { describe, it, expect } from 'vitest';
import { gcd, modPow, findPeriod, runShor, coprimes } from '../shor';

describe('Shor classical helpers', () => {
  it('computes gcd', () => {
    expect(gcd(48, 36)).toBe(12);
    expect(gcd(17, 5)).toBe(1);
  });

  it('modular exponentiation', () => {
    expect(modPow(7, 4, 15)).toBe(1);
    expect(modPow(2, 10, 1000)).toBe(24);
  });

  it('finds the period of 7 mod 15', () => {
    expect(findPeriod(7, 15)).toBe(4);
  });

  it('factors 15 with a = 7', () => {
    const r = runShor(15, 7);
    expect(r.period).toBe(4);
    expect(r.factors?.sort((a, b) => a - b)).toEqual([3, 5]);
  });

  it('factors 21', () => {
    const r = runShor(21, 2);
    expect(r.factors).not.toBeNull();
    expect((r.factors![0] * r.factors![1]) % 21).toBe(0);
  });

  it('lists coprimes', () => {
    expect(coprimes(15)).toContain(7);
    expect(coprimes(15)).not.toContain(5);
  });
});

import { describe, it, expect } from 'vitest';
import { fromAngles, toBloch, blochToAngles, slerpBloch } from '../bloch';

describe('Bloch coordinates', () => {
  it('maps |0> to the north pole', () => {
    const v = toBloch(fromAngles(0, 0));
    expect(v).toMatchObject({ x: expect.any(Number) });
    expect(v.z).toBeCloseTo(1);
  });

  it('maps |1> to the south pole', () => {
    const v = toBloch(fromAngles(Math.PI, 0));
    expect(v.z).toBeCloseTo(-1);
  });

  it('maps |+> to the +x axis', () => {
    const v = toBloch(fromAngles(Math.PI / 2, 0));
    expect(v.x).toBeCloseTo(1);
    expect(v.z).toBeCloseTo(0);
  });

  it('maps |+i> to the +y axis', () => {
    const v = toBloch(fromAngles(Math.PI / 2, Math.PI / 2));
    expect(v.y).toBeCloseTo(1);
  });

  it('round-trips angles', () => {
    const theta = 1.1;
    const phi = 2.3;
    const back = blochToAngles(toBloch(fromAngles(theta, phi)));
    expect(back.theta).toBeCloseTo(theta, 5);
    expect(back.phi).toBeCloseTo(phi, 5);
  });

  it('slerp endpoints are exact', () => {
    const a = { x: 0, y: 0, z: 1 };
    const b = { x: 1, y: 0, z: 0 };
    expect(slerpBloch(a, b, 1)).toMatchObject({ x: expect.any(Number) });
    const mid = slerpBloch(a, b, 0.5);
    expect(Math.hypot(mid.x, mid.y, mid.z)).toBeCloseTo(1, 5);
  });
});

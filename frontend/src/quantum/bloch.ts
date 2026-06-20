import { Complex } from './complex';
import { StateVector } from './statevector';

export interface BlochVector {
  x: number;
  y: number;
  z: number;
}

export interface SingleQubit {
  /** amplitude of |0> */
  alpha: Complex;
  /** amplitude of |1> */
  beta: Complex;
}

/**
 * Build a single-qubit state from Bloch angles.
 * |ψ> = cos(θ/2)|0> + e^{iφ} sin(θ/2)|1>, θ ∈ [0,π], φ ∈ [0,2π).
 */
export function fromAngles(theta: number, phi: number): SingleQubit {
  return {
    alpha: new Complex(Math.cos(theta / 2), 0),
    beta: Complex.polar(Math.sin(theta / 2), phi),
  };
}

/** Convert a single-qubit amplitude pair to a Bloch vector. */
export function toBloch({ alpha, beta }: SingleQubit): BlochVector {
  // x = 2 Re(α* β), y = 2 Im(α* β), z = |α|² − |β|²
  const ab = alpha.conjugate().mul(beta);
  return {
    x: 2 * ab.re,
    y: 2 * ab.im,
    z: alpha.abs2() - beta.abs2(),
  };
}

/** Recover (θ, φ) from a Bloch vector. */
export function blochToAngles(v: BlochVector): { theta: number; phi: number } {
  const r = Math.hypot(v.x, v.y, v.z) || 1;
  const theta = Math.acos(Math.min(1, Math.max(-1, v.z / r)));
  let phi = Math.atan2(v.y, v.x);
  if (phi < 0) phi += 2 * Math.PI;
  return { theta, phi };
}

/** Extract the single-qubit state from a 1-qubit StateVector. */
export function stateToQubit(sv: StateVector): SingleQubit {
  if (sv.numQubits !== 1) throw new Error('stateToQubit requires a 1-qubit state');
  return { alpha: sv.amplitudes[0], beta: sv.amplitudes[1] };
}

export function qubitToState(q: SingleQubit): StateVector {
  return new StateVector(1, [q.alpha, q.beta]);
}

/** Measurement probabilities for |0> and |1>. */
export function qubitProbabilities(q: SingleQubit): { p0: number; p1: number } {
  return { p0: q.alpha.abs2(), p1: q.beta.abs2() };
}

/**
 * Spherical-linear interpolation between two Bloch vectors - used to animate
 * a state-vector rotation smoothly along the sphere surface.
 */
export function slerpBloch(a: BlochVector, b: BlochVector, t: number): BlochVector {
  const dot = Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return b;
  const sin = Math.sin(omega);
  const wa = Math.sin((1 - t) * omega) / sin;
  const wb = Math.sin(t * omega) / sin;
  return {
    x: wa * a.x + wb * b.x,
    y: wa * a.y + wb * b.y,
    z: wa * a.z + wb * b.z,
  };
}

import { Complex } from './complex';
import { Gate2, resolveGate } from './gates';

/**
 * Dense statevector simulator for an n-qubit register.
 *
 * Convention: qubit 0 is the least-significant bit. Basis state index `i`
 * encodes the bit string b_{n-1}...b_1 b_0 where b_q = (i >> q) & 1. This
 * matches Qiskit's little-endian ordering so QASM exported from here behaves
 * identically when re-run on the Python/Qiskit backend.
 */
export class StateVector {
  readonly amplitudes: Complex[];

  constructor(
    public readonly numQubits: number,
    amplitudes?: Complex[],
  ) {
    const dim = 1 << numQubits;
    if (amplitudes) {
      if (amplitudes.length !== dim) {
        throw new Error(`Expected ${dim} amplitudes, got ${amplitudes.length}`);
      }
      this.amplitudes = amplitudes;
    } else {
      this.amplitudes = Array.from({ length: dim }, (_, i) =>
        i === 0 ? Complex.ONE : Complex.ZERO,
      );
    }
  }

  static zero(numQubits: number): StateVector {
    return new StateVector(numQubits);
  }

  clone(): StateVector {
    return new StateVector(this.numQubits, this.amplitudes.slice());
  }

  /** Apply a single-qubit gate to `target`, returning a new state. */
  applySingle(matrix: Gate2, target: number): StateVector {
    const out = this.amplitudes.slice();
    const dim = out.length;
    const bit = 1 << target;
    for (let i = 0; i < dim; i++) {
      if ((i & bit) === 0) {
        const j = i | bit;
        const a0 = this.amplitudes[i];
        const a1 = this.amplitudes[j];
        out[i] = matrix[0][0].mul(a0).add(matrix[0][1].mul(a1));
        out[j] = matrix[1][0].mul(a0).add(matrix[1][1].mul(a1));
      }
    }
    return new StateVector(this.numQubits, out);
  }

  /** Apply a controlled single-qubit gate. */
  applyControlled(matrix: Gate2, control: number, target: number): StateVector {
    const out = this.amplitudes.slice();
    const dim = out.length;
    const cbit = 1 << control;
    const tbit = 1 << target;
    for (let i = 0; i < dim; i++) {
      if ((i & cbit) !== 0 && (i & tbit) === 0) {
        const j = i | tbit;
        const a0 = this.amplitudes[i];
        const a1 = this.amplitudes[j];
        out[i] = matrix[0][0].mul(a0).add(matrix[0][1].mul(a1));
        out[j] = matrix[1][0].mul(a0).add(matrix[1][1].mul(a1));
      }
    }
    return new StateVector(this.numQubits, out);
  }

  /** Swap two qubits. */
  applySwap(a: number, b: number): StateVector {
    if (a === b) return this.clone();
    const out = this.amplitudes.slice();
    const dim = out.length;
    const abit = 1 << a;
    const bbit = 1 << b;
    for (let i = 0; i < dim; i++) {
      const ai = (i & abit) !== 0 ? 1 : 0;
      const bi = (i & bbit) !== 0 ? 1 : 0;
      if (ai !== bi) {
        const j = (i ^ abit) ^ bbit;
        if (i < j) {
          const tmp = out[i];
          out[i] = out[j];
          out[j] = tmp;
        }
      }
    }
    return new StateVector(this.numQubits, out);
  }

  /** Convenience: apply a named gate by id with optional parameter. */
  applyGate(id: string, target: number, param?: number): StateVector {
    return this.applySingle(resolveGate(id, param), target);
  }

  /** Probability of measuring each computational basis state. */
  probabilities(): number[] {
    return this.amplitudes.map((a) => a.abs2());
  }

  /** Marginal probability that `qubit` reads 1. */
  qubitProbabilityOne(qubit: number): number {
    const bit = 1 << qubit;
    let p = 0;
    for (let i = 0; i < this.amplitudes.length; i++) {
      if ((i & bit) !== 0) p += this.amplitudes[i].abs2();
    }
    return p;
  }

  /**
   * Collapse `qubit` to a definite outcome (deterministic if `forced`
   * provided, otherwise sampled). Returns the post-measurement state and the
   * outcome bit.
   */
  measureQubit(qubit: number, forced?: 0 | 1, rng: () => number = Math.random): {
    state: StateVector;
    outcome: 0 | 1;
  } {
    const pOne = this.qubitProbabilityOne(qubit);
    const outcome: 0 | 1 = forced ?? (rng() < pOne ? 1 : 0);
    const norm = outcome === 1 ? pOne : 1 - pOne;
    const bit = 1 << qubit;
    const out = this.amplitudes.map((a, i) => {
      const matches = ((i & bit) !== 0 ? 1 : 0) === outcome;
      return matches && norm > 1e-12 ? a.scale(1 / Math.sqrt(norm)) : Complex.ZERO;
    });
    return { state: new StateVector(this.numQubits, out), outcome };
  }

  /** Sample a full-register measurement, returning a bit string (MSB first). */
  sample(rng: () => number = Math.random): string {
    const probs = this.probabilities();
    let r = rng();
    let idx = 0;
    for (let i = 0; i < probs.length; i++) {
      r -= probs[i];
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    return indexToBitstring(idx, this.numQubits);
  }

  /** Run `shots` measurements and return a histogram keyed by bit string. */
  measureCounts(shots: number, rng: () => number = Math.random): Record<string, number> {
    const counts: Record<string, number> = {};
    for (let s = 0; s < shots; s++) {
      const key = this.sample(rng);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }

  /** Dirac-notation string, omitting negligible amplitudes. */
  toDirac(eps = 1e-6, precision = 3): string {
    const terms: string[] = [];
    for (let i = 0; i < this.amplitudes.length; i++) {
      const a = this.amplitudes[i];
      if (a.abs2() < eps) continue;
      terms.push(`(${a.toString(precision)})|${indexToBitstring(i, this.numQubits)}⟩`);
    }
    return terms.length ? terms.join(' + ') : '0';
  }
}

export function indexToBitstring(index: number, numQubits: number): string {
  return index.toString(2).padStart(numQubits, '0');
}

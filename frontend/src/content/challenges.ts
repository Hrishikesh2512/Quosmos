import { Circuit, statevectorOf } from '@/quantum/circuit';
import { StateVector } from '@/quantum/statevector';

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  brief: string;
  goal: string;
  numQubits: number;
  hints: string[];
  /** Returns true when the user's circuit satisfies the objective. */
  validate: (circuit: Circuit) => boolean;
}

/** Compare a circuit's output statevector against a target (up to global phase). */
function matchesState(circuit: Circuit, target: number[][]): boolean {
  const sv = statevectorOf(circuit);
  if (sv.numQubits !== Math.log2(target.length)) return false;
  // Cancel global phase using the first significant amplitude.
  const ref = sv.amplitudes.findIndex((a) => a.abs2() > 1e-6);
  if (ref === -1) return false;
  const phase = sv.amplitudes[ref].phase();
  const cos = Math.cos(-phase);
  const sin = Math.sin(-phase);
  for (let i = 0; i < target.length; i++) {
    const a = sv.amplitudes[i];
    const re = a.re * cos - a.im * sin;
    const im = a.re * sin + a.im * cos;
    if (Math.abs(re - target[i][0]) > 1e-3 || Math.abs(im - target[i][1]) > 1e-3) return false;
  }
  return true;
}

const INV2 = 1 / Math.SQRT2;

export const CHALLENGES: Challenge[] = [
  {
    id: 'superposition',
    title: 'Create a superposition',
    difficulty: 'beginner',
    brief: 'Put a single qubit into an equal superposition of |0⟩ and |1⟩.',
    goal: 'Reach the state (|0⟩ + |1⟩)/√2.',
    numQubits: 1,
    hints: ['One gate is enough.', 'The Hadamard gate maps |0⟩ to the equal superposition.'],
    validate: (c) =>
      matchesState(c, [
        [INV2, 0],
        [INV2, 0],
      ]),
  },
  {
    id: 'bell',
    title: 'Create a Bell state',
    difficulty: 'beginner',
    brief: 'Entangle two qubits into the |Φ⁺⟩ Bell state.',
    goal: 'Reach (|00⟩ + |11⟩)/√2.',
    numQubits: 2,
    hints: ['Start with a Hadamard on qubit 0.', 'Then a CNOT from qubit 0 to qubit 1.'],
    validate: (c) =>
      matchesState(c, [
        [INV2, 0],
        [0, 0],
        [0, 0],
        [INV2, 0],
      ]),
  },
  {
    id: 'flip',
    title: 'Flip to |1⟩',
    difficulty: 'beginner',
    brief: 'Turn |0⟩ into |1⟩.',
    goal: 'Reach the state |1⟩.',
    numQubits: 1,
    hints: ['The Pauli-X gate is the quantum NOT.'],
    validate: (c) =>
      matchesState(c, [
        [0, 0],
        [1, 0],
      ]),
  },
  {
    id: 'ghz',
    title: 'Build a GHZ state',
    difficulty: 'intermediate',
    brief: 'Create a three-qubit GHZ state - maximal multipartite entanglement.',
    goal: 'Reach (|000⟩ + |111⟩)/√2.',
    numQubits: 3,
    hints: ['Hadamard on qubit 0.', 'Chain two CNOTs: 0→1 then 1→2.'],
    validate: (c) => {
      const t = Array.from({ length: 8 }, (_, i) => (i === 0 || i === 7 ? [INV2, 0] : [0, 0]));
      return matchesState(c, t);
    },
  },
  {
    id: 'minus',
    title: 'Reach the |−⟩ state',
    difficulty: 'intermediate',
    brief: 'Produce the equal superposition with a negative relative phase.',
    goal: 'Reach (|0⟩ − |1⟩)/√2.',
    numQubits: 1,
    hints: ['Apply X before H, or H then Z.'],
    validate: (c) =>
      matchesState(c, [
        [INV2, 0],
        [-INV2, 0],
      ]),
  },
  {
    id: 'phi-minus',
    title: 'Bell state |Φ⁻⟩',
    difficulty: 'advanced',
    brief: 'Create the Bell state with a relative minus sign.',
    goal: 'Reach (|00⟩ − |11⟩)/√2.',
    numQubits: 2,
    hints: ['Build |Φ⁺⟩ first, then add a Z on qubit 0.'],
    validate: (c) =>
      matchesState(c, [
        [INV2, 0],
        [0, 0],
        [0, 0],
        [-INV2, 0],
      ]),
  },
];

export function describeState(sv: StateVector): string {
  return sv.toDirac();
}

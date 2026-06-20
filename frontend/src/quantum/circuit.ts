import { StateVector } from './statevector';
import { GATES, resolveGate } from './gates';

export interface CircuitOp {
  id: string;
  /** gate id: X,Y,Z,H,S,T,RX,RY,RZ,P,CX,CZ,SWAP,M */
  gate: string;
  /** qubit(s) the op acts on; for CX/CZ: [control, target]; SWAP: [a,b] */
  qubits: number[];
  /** time-slice column index in the diagram */
  column: number;
  /** rotation angle for parametric gates (radians) */
  param?: number;
}

export interface Circuit {
  numQubits: number;
  ops: CircuitOp[];
}

let opCounter = 0;
export function makeOpId(): string {
  return `op_${Date.now().toString(36)}_${(opCounter++).toString(36)}`;
}

export function emptyCircuit(numQubits = 2): Circuit {
  return { numQubits, ops: [] };
}

/** Ops sorted by column then leading qubit — execution order. */
export function orderedOps(circuit: Circuit): CircuitOp[] {
  return [...circuit.ops].sort((a, b) =>
    a.column !== b.column ? a.column - b.column : a.qubits[0] - b.qubits[0],
  );
}

export interface SimulationResult {
  state: StateVector;
  probabilities: number[];
  measuredQubits: number[];
}

/**
 * Simulate the circuit on the all-zero input, applying measurements as
 * projective collapses (deterministic statevector by sampling each measure).
 * Measurements are treated as deferred for statistics via `measureCounts`.
 */
export function simulate(circuit: Circuit, rng: () => number = Math.random): SimulationResult {
  let state = StateVector.zero(circuit.numQubits);
  const measured: number[] = [];
  for (const op of orderedOps(circuit)) {
    switch (op.gate) {
      case 'CX':
        state = state.applyControlled(GATES.X, op.qubits[0], op.qubits[1]);
        break;
      case 'CZ':
        state = state.applyControlled(GATES.Z, op.qubits[0], op.qubits[1]);
        break;
      case 'SWAP':
        state = state.applySwap(op.qubits[0], op.qubits[1]);
        break;
      case 'M': {
        const { state: collapsed } = state.measureQubit(op.qubits[0], undefined, rng);
        state = collapsed;
        measured.push(op.qubits[0]);
        break;
      }
      default:
        state = state.applySingle(resolveGate(op.gate, op.param), op.qubits[0]);
    }
  }
  return {
    state,
    probabilities: state.probabilities(),
    measuredQubits: measured,
  };
}

/**
 * Compute the statevector ignoring measurement ops — the pure unitary state.
 * Useful for the Bloch/statevector panels which want the coherent state.
 */
export function statevectorOf(circuit: Circuit): StateVector {
  const unitary: Circuit = { ...circuit, ops: circuit.ops.filter((o) => o.gate !== 'M') };
  return simulate(unitary).state;
}

/** Counts histogram across `shots` independent runs (re-samples each shot). */
export function measureStatistics(
  circuit: Circuit,
  shots: number,
  rng: () => number = Math.random,
): Record<string, number> {
  const measured = circuit.ops.filter((o) => o.gate === 'M').map((o) => o.qubits[0]);
  const state = statevectorOf(circuit);
  if (measured.length === 0) {
    return state.measureCounts(shots, rng);
  }
  const counts: Record<string, number> = {};
  for (let s = 0; s < shots; s++) {
    let work = state;
    const bits: Record<number, number> = {};
    for (const q of measured) {
      const { state: collapsed, outcome } = work.measureQubit(q, undefined, rng);
      work = collapsed;
      bits[q] = outcome;
    }
    const key = measured
      .slice()
      .sort((a, b) => b - a)
      .map((q) => bits[q])
      .join('');
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

/** Maximum column index in use (for laying out the grid). */
export function maxColumn(circuit: Circuit): number {
  return circuit.ops.reduce((m, o) => Math.max(m, o.column), -1);
}

/** Is a (column, qubit) cell occupied? Accounts for multi-qubit spans. */
export function cellOccupied(circuit: Circuit, column: number, qubit: number): CircuitOp | undefined {
  return circuit.ops.find((o) => {
    if (o.column !== column) return false;
    if (o.qubits.includes(qubit)) return true;
    // multi-qubit gates occupy the span between their wires
    if (o.qubits.length === 2) {
      const [a, b] = o.qubits;
      return qubit > Math.min(a, b) && qubit < Math.max(a, b);
    }
    return false;
  });
}

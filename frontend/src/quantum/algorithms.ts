import { Circuit, CircuitOp, makeOpId } from './circuit';

/**
 * Factory helpers that build canonical teaching circuits. Each returns a fully
 * laid-out Circuit (columns assigned) ready for the builder, simulator, and
 * QASM/Qiskit exporters.
 */

function op(gate: string, qubits: number[], column: number, param?: number): CircuitOp {
  return { id: makeOpId(), gate, qubits, column, param };
}

/** Bell state |Φ+> = (|00> + |11>)/√2. */
export function bellState(): Circuit {
  return {
    numQubits: 2,
    ops: [op('H', [0], 0), op('CX', [0, 1], 1)],
  };
}

/** The four Bell states selectable by index 0..3 (Φ+, Φ-, Ψ+, Ψ-). */
export function bellVariant(index: 0 | 1 | 2 | 3): Circuit {
  const ops: CircuitOp[] = [op('H', [0], 0), op('CX', [0, 1], 1)];
  // bit 0 -> apply X on qubit0 before -> Ψ; bit 1 -> apply Z -> minus phase
  let col = 2;
  if (index & 1) ops.unshift(op('X', [1], 0));
  if (index & 2) ops.push(op('Z', [0], col++));
  // re-flow columns
  return reflow({ numQubits: 2, ops });
}

/** Superdense coding encode circuit for a 2-bit message on the sender's qubit. */
export function superdenseEncode(message: number): Circuit {
  const ops: CircuitOp[] = [op('H', [0], 0), op('CX', [0, 1], 1)]; // shared Bell pair
  let col = 2;
  // message bits b1 b0 -> apply Z for b1, X for b0 on qubit 0 (Alice's)
  if (message & 1) ops.push(op('X', [0], col++));
  if (message & 2) ops.push(op('Z', [0], col++));
  // Bob decodes
  ops.push(op('CX', [0, 1], col++));
  ops.push(op('H', [0], col++));
  ops.push(op('M', [0], col));
  ops.push(op('M', [1], col));
  return reflow({ numQubits: 2, ops });
}

/** Quantum teleportation of qubit 0 to qubit 2. */
export function teleportation(): Circuit {
  const ops: CircuitOp[] = [
    // entangle the Bell pair on qubits 1 & 2
    op('H', [1], 0),
    op('CX', [1, 2], 1),
    // Bell measurement on qubits 0 & 1
    op('CX', [0, 1], 2),
    op('H', [0], 3),
    op('M', [0], 4),
    op('M', [1], 4),
    // corrections on qubit 2 (controlled classically — modelled as CX/CZ)
    op('CX', [1, 2], 5),
    op('CZ', [0, 2], 6),
  ];
  return reflow({ numQubits: 3, ops });
}

/** Deutsch–Jozsa for n input qubits. `oracle` ∈ {constant0, constant1, balanced}. */
export function deutschJozsa(n: number, oracle: 'constant0' | 'constant1' | 'balanced'): Circuit {
  const ops: CircuitOp[] = [];
  let col = 0;
  ops.push(op('X', [n], col)); // ancilla to |1>
  for (let q = 0; q <= n; q++) ops.push(op('H', [q], col));
  col++;
  if (oracle === 'constant1') {
    ops.push(op('X', [n], col++));
  } else if (oracle === 'balanced') {
    for (let q = 0; q < n; q++) ops.push(op('CX', [q, n], col++));
  }
  for (let q = 0; q < n; q++) ops.push(op('H', [q], col));
  col++;
  for (let q = 0; q < n; q++) ops.push(op('M', [q], col));
  return reflow({ numQubits: n + 1, ops });
}

/** Grover search over 2 qubits marking the |11> state (single iteration). */
export function grover2(): Circuit {
  const ops: CircuitOp[] = [
    op('H', [0], 0),
    op('H', [1], 0),
    // oracle marks |11>
    op('CZ', [0, 1], 1),
    // diffusion
    op('H', [0], 2),
    op('H', [1], 2),
    op('Z', [0], 3),
    op('Z', [1], 3),
    op('CZ', [0, 1], 4),
    op('H', [0], 5),
    op('H', [1], 5),
    op('M', [0], 6),
    op('M', [1], 6),
  ];
  return reflow({ numQubits: 2, ops });
}

/** Quantum Fourier Transform on n qubits. */
export function qft(n: number): Circuit {
  const ops: CircuitOp[] = [];
  let col = 0;
  for (let j = n - 1; j >= 0; j--) {
    ops.push(op('H', [j], col++));
    for (let k = j - 1; k >= 0; k--) {
      const angle = Math.PI / 2 ** (j - k);
      // controlled phase approximated as control-P via P on target between CX
      ops.push(op('P', [j], col, angle));
      ops.push(op('CX', [k, j], col + 1));
      ops.push(op('P', [j], col + 2, -angle));
      ops.push(op('CX', [k, j], col + 3));
      col += 4;
    }
  }
  for (let i = 0; i < Math.floor(n / 2); i++) {
    ops.push(op('SWAP', [i, n - 1 - i], col++));
  }
  return reflow({ numQubits: n, ops });
}

export interface AlgorithmStep {
  title: string;
  description: string;
  math: string;
  highlightColumns: number[];
}

/** Narration steps shown alongside the algorithm animation. */
export const ALGORITHM_STEPS: Record<string, AlgorithmStep[]> = {
  'deutsch-jozsa': [
    { title: 'Initialise', description: 'Set ancilla to |1⟩ and apply Hadamards to all qubits.', math: '|0\\rangle^{\\otimes n}|1\\rangle \\xrightarrow{H^{\\otimes n+1}} \\frac{1}{\\sqrt{2^{n+1}}}\\sum_x |x\\rangle(|0\\rangle-|1\\rangle)', highlightColumns: [0] },
    { title: 'Oracle', description: 'Apply the function oracle Uf. Phase kickback encodes f(x).', math: '\\xrightarrow{U_f} \\frac{1}{\\sqrt{2^n}}\\sum_x (-1)^{f(x)}|x\\rangle(\\ldots)', highlightColumns: [1] },
    { title: 'Interfere', description: 'Hadamards again. Constant ⇒ all-zero amplitude; balanced ⇒ none.', math: '\\xrightarrow{H^{\\otimes n}} \\text{measure } |0\\rangle^{\\otimes n}?', highlightColumns: [2] },
    { title: 'Measure', description: 'All zeros ⇒ constant. Anything else ⇒ balanced. One query!', math: 'P(0\\ldots0) = 1 \\text{ iff constant}', highlightColumns: [3] },
  ],
  grover: [
    { title: 'Superposition', description: 'Hadamards create a uniform superposition over all states.', math: '|s\\rangle = \\frac{1}{\\sqrt N}\\sum_x |x\\rangle', highlightColumns: [0] },
    { title: 'Oracle', description: 'Flip the phase of the marked state |11⟩.', math: 'U_\\omega|x\\rangle = (-1)^{[x=\\omega]}|x\\rangle', highlightColumns: [1] },
    { title: 'Diffusion', description: 'Reflect about the mean — amplifies the marked amplitude.', math: '2|s\\rangle\\langle s| - I', highlightColumns: [2, 3, 4] },
    { title: 'Measure', description: 'Marked state now dominates the distribution.', math: 'P(\\omega) \\approx \\sin^2((2t+1)\\theta)', highlightColumns: [6] },
  ],
  qft: [
    { title: 'Hadamard ladder', description: 'Each qubit gets a Hadamard then controlled phase rotations.', math: 'QFT|x\\rangle = \\frac{1}{\\sqrt N}\\sum_k e^{2\\pi i xk/N}|k\\rangle', highlightColumns: [0] },
    { title: 'Controlled phases', description: 'Smaller and smaller rotations entangle frequency information.', math: 'R_k = \\begin{pmatrix}1&0\\\\0&e^{2\\pi i/2^k}\\end{pmatrix}', highlightColumns: [1] },
    { title: 'Bit reversal', description: 'Swap network reverses qubit order to match the standard QFT.', math: '|q_0 q_1 \\ldots\\rangle \\to |\\ldots q_1 q_0\\rangle', highlightColumns: [] },
  ],
  shor: [
    { title: 'Pick a', description: 'Choose a random a coprime to N; reduce factoring to period finding.', math: 'f(x) = a^x \\bmod N', highlightColumns: [] },
    { title: 'Superposition', description: 'Hadamard the counting register to query all exponents at once.', math: '\\frac{1}{\\sqrt Q}\\sum_x |x\\rangle|a^x \\bmod N\\rangle', highlightColumns: [0] },
    { title: 'Modular exponentiation', description: 'Entangle counting and work registers via repeated squaring.', math: 'U_a|y\\rangle = |ay \\bmod N\\rangle', highlightColumns: [1] },
    { title: 'Inverse QFT', description: 'Extract the period r from the counting register.', math: 'x/Q \\approx s/r', highlightColumns: [2] },
    { title: 'Classical post-processing', description: 'Continued fractions recover r; then gcd(a^{r/2}±1, N) gives factors.', math: '\\gcd(a^{r/2} \\pm 1, N)', highlightColumns: [] },
  ],
};

/** Re-pack op columns to remove gaps while preserving relative order. */
export function reflow(circuit: Circuit): Circuit {
  const cols = [...new Set(circuit.ops.map((o) => o.column))].sort((a, b) => a - b);
  const remap = new Map(cols.map((c, i) => [c, i]));
  return {
    numQubits: circuit.numQubits,
    ops: circuit.ops.map((o) => ({ ...o, column: remap.get(o.column) ?? o.column })),
  };
}

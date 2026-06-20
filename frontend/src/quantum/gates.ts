import { Complex } from './complex';

/** A 2x2 single-qubit gate matrix, row-major: [[a,b],[c,d]]. */
export type Gate2 = [[Complex, Complex], [Complex, Complex]];

const c = (re: number, im = 0) => new Complex(re, im);
const INV_SQRT2 = 1 / Math.SQRT2;

/** Catalogue of supported single-qubit gates (static matrices). */
export const GATES: Record<string, Gate2> = {
  I: [
    [c(1), c(0)],
    [c(0), c(1)],
  ],
  X: [
    [c(0), c(1)],
    [c(1), c(0)],
  ],
  Y: [
    [c(0), c(0, -1)],
    [c(0, 1), c(0)],
  ],
  Z: [
    [c(1), c(0)],
    [c(0), c(-1)],
  ],
  H: [
    [c(INV_SQRT2), c(INV_SQRT2)],
    [c(INV_SQRT2), c(-INV_SQRT2)],
  ],
  S: [
    [c(1), c(0)],
    [c(0), c(0, 1)],
  ],
  Sdg: [
    [c(1), c(0)],
    [c(0), c(0, -1)],
  ],
  T: [
    [c(1), c(0)],
    [c(0), Complex.polar(1, Math.PI / 4)],
  ],
  Tdg: [
    [c(1), c(0)],
    [c(0), Complex.polar(1, -Math.PI / 4)],
  ],
};

/** RX(θ) = exp(-i θ X / 2). */
export function RX(theta: number): Gate2 {
  const cos = Math.cos(theta / 2);
  const sin = Math.sin(theta / 2);
  return [
    [c(cos), c(0, -sin)],
    [c(0, -sin), c(cos)],
  ];
}

/** RY(θ) = exp(-i θ Y / 2). */
export function RY(theta: number): Gate2 {
  const cos = Math.cos(theta / 2);
  const sin = Math.sin(theta / 2);
  return [
    [c(cos), c(-sin)],
    [c(sin), c(cos)],
  ];
}

/** RZ(θ) = exp(-i θ Z / 2). */
export function RZ(theta: number): Gate2 {
  return [
    [Complex.polar(1, -theta / 2), c(0)],
    [c(0), Complex.polar(1, theta / 2)],
  ];
}

/** Phase gate P(λ) = diag(1, e^{iλ}). */
export function PHASE(lambda: number): Gate2 {
  return [
    [c(1), c(0)],
    [c(0), Complex.polar(1, lambda)],
  ];
}

/** Resolve a gate id (possibly parameterised) to its matrix. */
export function resolveGate(id: string, param?: number): Gate2 {
  switch (id) {
    case 'RX':
      return RX(param ?? 0);
    case 'RY':
      return RY(param ?? 0);
    case 'RZ':
      return RZ(param ?? 0);
    case 'P':
      return PHASE(param ?? 0);
    default: {
      const g = GATES[id];
      if (!g) throw new Error(`Unknown gate: ${id}`);
      return g;
    }
  }
}

/** Whether a gate id takes a continuous parameter. */
export function isParametric(id: string): boolean {
  return id === 'RX' || id === 'RY' || id === 'RZ' || id === 'P';
}

export interface GateInfo {
  id: string;
  label: string;
  description: string;
  parametric: boolean;
  category: 'pauli' | 'hadamard' | 'phase' | 'rotation' | 'control' | 'measure';
  color: string;
}

/** Metadata used by the circuit builder palette and tutor. */
export const GATE_CATALOGUE: GateInfo[] = [
  { id: 'X', label: 'X', description: 'Pauli-X (bit flip / NOT)', parametric: false, category: 'pauli', color: '#f472b6' },
  { id: 'Y', label: 'Y', description: 'Pauli-Y', parametric: false, category: 'pauli', color: '#fb7185' },
  { id: 'Z', label: 'Z', description: 'Pauli-Z (phase flip)', parametric: false, category: 'pauli', color: '#f59e0b' },
  { id: 'H', label: 'H', description: 'Hadamard — creates superposition', parametric: false, category: 'hadamard', color: '#34d399' },
  { id: 'S', label: 'S', description: 'Phase gate (√Z)', parametric: false, category: 'phase', color: '#60a5fa' },
  { id: 'T', label: 'T', description: 'π/8 gate (⁴√Z)', parametric: false, category: 'phase', color: '#818cf8' },
  { id: 'RX', label: 'RX', description: 'Rotation about X axis', parametric: true, category: 'rotation', color: '#a78bfa' },
  { id: 'RY', label: 'RY', description: 'Rotation about Y axis', parametric: true, category: 'rotation', color: '#c084fc' },
  { id: 'RZ', label: 'RZ', description: 'Rotation about Z axis', parametric: true, category: 'rotation', color: '#e879f9' },
  { id: 'CX', label: '●⊕', description: 'CNOT — controlled-X', parametric: false, category: 'control', color: '#22d3ee' },
  { id: 'CZ', label: '●Z', description: 'Controlled-Z', parametric: false, category: 'control', color: '#2dd4bf' },
  { id: 'SWAP', label: '⨉', description: 'Swap two qubits', parametric: false, category: 'control', color: '#94a3b8' },
  { id: 'M', label: 'M', description: 'Measurement in computational basis', parametric: false, category: 'measure', color: '#64748b' },
];

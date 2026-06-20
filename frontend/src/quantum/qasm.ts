import { Circuit, CircuitOp, makeOpId, orderedOps } from './circuit';
import { isParametric } from './gates';

/** Map internal gate ids to OpenQASM 2.0 mnemonics. */
const QASM_NAME: Record<string, string> = {
  X: 'x',
  Y: 'y',
  Z: 'z',
  H: 'h',
  S: 's',
  Sdg: 'sdg',
  T: 't',
  Tdg: 'tdg',
  RX: 'rx',
  RY: 'ry',
  RZ: 'rz',
  P: 'p',
  CX: 'cx',
  CZ: 'cz',
  SWAP: 'swap',
};

/** Export a circuit to OpenQASM 2.0. */
export function toQASM(circuit: Circuit): string {
  const lines = ['OPENQASM 2.0;', 'include "qelib1.inc";', ''];
  lines.push(`qreg q[${circuit.numQubits}];`);
  const measured = circuit.ops.filter((o) => o.gate === 'M');
  if (measured.length) lines.push(`creg c[${circuit.numQubits}];`);
  lines.push('');

  for (const op of orderedOps(circuit)) {
    if (op.gate === 'M') {
      lines.push(`measure q[${op.qubits[0]}] -> c[${op.qubits[0]}];`);
      continue;
    }
    const name = QASM_NAME[op.gate];
    if (!name) continue;
    const args = op.qubits.map((q) => `q[${q}]`).join(',');
    if (isParametric(op.gate)) {
      lines.push(`${name}(${(op.param ?? 0).toFixed(6)}) ${args};`);
    } else {
      lines.push(`${name} ${args};`);
    }
  }
  return lines.join('\n') + '\n';
}

/** Generate runnable Qiskit Python from a circuit. */
export function toQiskit(circuit: Circuit): string {
  const lines = [
    'from qiskit import QuantumCircuit',
    'from qiskit.quantum_info import Statevector',
    '',
    `qc = QuantumCircuit(${circuit.numQubits}, ${circuit.numQubits})`,
    '',
  ];
  for (const op of orderedOps(circuit)) {
    if (op.gate === 'M') {
      lines.push(`qc.measure(${op.qubits[0]}, ${op.qubits[0]})`);
      continue;
    }
    const name = (QASM_NAME[op.gate] ?? op.gate).toLowerCase();
    if (isParametric(op.gate)) {
      lines.push(`qc.${name}(${(op.param ?? 0).toFixed(6)}, ${op.qubits[0]})`);
    } else {
      lines.push(`qc.${name}(${op.qubits.join(', ')})`);
    }
  }
  lines.push('', 'print(qc.draw())', 'print(Statevector(qc.remove_final_measurements(inplace=False)))');
  return lines.join('\n') + '\n';
}

const NAME_QASM: Record<string, string> = Object.fromEntries(
  Object.entries(QASM_NAME).map(([k, v]) => [v, k]),
);

/** Parse a (subset of) OpenQASM 2.0 into a circuit. Throws on malformed input. */
export function fromQASM(source: string): Circuit {
  const cleaned = source
    .replace(/\/\/.*$/gm, '')
    .split(/[;\n]/)
    .map((l) => l.trim())
    .filter(Boolean);

  let numQubits = 0;
  const ops: CircuitOp[] = [];
  // track next free column per qubit so imported gates stack left-to-right
  const nextCol: Record<number, number> = {};
  const colFor = (qubits: number[]): number => {
    const col = Math.max(0, ...qubits.map((q) => nextCol[q] ?? 0));
    qubits.forEach((q) => (nextCol[q] = col + 1));
    return col;
  };

  for (const stmt of cleaned) {
    if (stmt.startsWith('OPENQASM') || stmt.startsWith('include') || stmt.startsWith('creg')) {
      continue;
    }
    const qreg = stmt.match(/^qreg\s+\w+\[(\d+)\]/);
    if (qreg) {
      numQubits = parseInt(qreg[1], 10);
      continue;
    }
    const meas = stmt.match(/^measure\s+\w+\[(\d+)\]/);
    if (meas) {
      const q = parseInt(meas[1], 10);
      ops.push({ id: makeOpId(), gate: 'M', qubits: [q], column: colFor([q]) });
      continue;
    }
    const gate = stmt.match(/^(\w+)(?:\(([^)]*)\))?\s+(.+)$/);
    if (!gate) continue;
    const [, rawName, rawParam, rawArgs] = gate;
    const internal = NAME_QASM[rawName];
    if (!internal) continue;
    const qubits = [...rawArgs.matchAll(/\w+\[(\d+)\]/g)].map((m) => parseInt(m[1], 10));
    const param = rawParam !== undefined ? evalAngle(rawParam) : undefined;
    ops.push({ id: makeOpId(), gate: internal, qubits, column: colFor(qubits), param });
  }

  if (numQubits === 0) {
    numQubits = Math.max(1, ...ops.flatMap((o) => o.qubits).map((q) => q + 1));
  }
  return { numQubits, ops };
}

/** Evaluate simple angle expressions like `pi/2`, `3*pi/4`, `0.7853`. */
function evalAngle(expr: string): number {
  const normalised = expr.replace(/pi/gi, `${Math.PI}`).trim();
  if (!/^[-+*/.()0-9\s]+$/.test(normalised)) {
    const n = parseFloat(expr);
    return Number.isNaN(n) ? 0 : n;
  }
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${normalised});`)() as number;
}

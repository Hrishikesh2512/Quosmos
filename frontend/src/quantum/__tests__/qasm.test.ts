import { describe, it, expect } from 'vitest';
import { toQASM, toQiskit, fromQASM } from '../qasm';
import { bellState } from '../algorithms';
import { statevectorOf } from '../circuit';

describe('QASM / Qiskit IO', () => {
  it('exports OpenQASM for a Bell circuit', () => {
    const qasm = toQASM(bellState());
    expect(qasm).toContain('OPENQASM 2.0;');
    expect(qasm).toContain('qreg q[2];');
    expect(qasm).toContain('h q[0];');
    expect(qasm).toContain('cx q[0],q[1];');
  });

  it('exports Qiskit python', () => {
    const py = toQiskit(bellState());
    expect(py).toContain('QuantumCircuit(2, 2)');
    expect(py).toContain('qc.h(0)');
    expect(py).toContain('qc.cx(0, 1)');
  });

  it('round-trips QASM back to an equivalent state', () => {
    const original = bellState();
    const restored = fromQASM(toQASM(original));
    const a = statevectorOf(original).probabilities();
    const b = statevectorOf(restored).probabilities();
    a.forEach((p, i) => expect(p).toBeCloseTo(b[i], 6));
  });

  it('parses parametric gates with pi expressions', () => {
    const circuit = fromQASM('qreg q[1];\nrx(pi/2) q[0];');
    expect(circuit.ops[0].gate).toBe('RX');
    expect(circuit.ops[0].param).toBeCloseTo(Math.PI / 2);
  });

  it('infers qubit count when qreg is missing', () => {
    const circuit = fromQASM('h q[0];\ncx q[0],q[2];');
    expect(circuit.numQubits).toBe(3);
  });
});

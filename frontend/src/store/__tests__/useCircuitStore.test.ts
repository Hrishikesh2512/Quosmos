import { describe, it, expect, beforeEach } from 'vitest';
import { useCircuitStore } from '../useCircuitStore';
import { emptyCircuit } from '@/quantum/circuit';

const reset = () =>
  useCircuitStore.setState({ past: [], present: emptyCircuit(2), future: [], selectedOpId: null });

describe('useCircuitStore', () => {
  beforeEach(reset);

  it('adds an op and records history', () => {
    const { addOp } = useCircuitStore.getState();
    addOp({ gate: 'H', qubits: [0], column: 0 });
    const s = useCircuitStore.getState();
    expect(s.present.ops).toHaveLength(1);
    expect(s.canUndo()).toBe(true);
  });

  it('undo and redo restore state', () => {
    const { addOp, undo, redo } = useCircuitStore.getState();
    addOp({ gate: 'H', qubits: [0], column: 0 });
    undo();
    expect(useCircuitStore.getState().present.ops).toHaveLength(0);
    redo();
    expect(useCircuitStore.getState().present.ops).toHaveLength(1);
  });

  it('removes an op', () => {
    const { addOp } = useCircuitStore.getState();
    addOp({ gate: 'X', qubits: [0], column: 0 });
    const id = useCircuitStore.getState().present.ops[0].id;
    useCircuitStore.getState().removeOp(id);
    expect(useCircuitStore.getState().present.ops).toHaveLength(0);
  });

  it('duplicates an op into the next column', () => {
    const { addOp, duplicateOp } = useCircuitStore.getState();
    addOp({ gate: 'X', qubits: [0], column: 0 });
    const id = useCircuitStore.getState().present.ops[0].id;
    duplicateOp(id);
    const ops = useCircuitStore.getState().present.ops;
    expect(ops).toHaveLength(2);
    expect(ops[1].column).toBe(1);
  });

  it('adds and removes qubits within bounds', () => {
    const { addQubit, removeQubit } = useCircuitStore.getState();
    addQubit();
    expect(useCircuitStore.getState().present.numQubits).toBe(3);
    removeQubit();
    removeQubit();
    expect(useCircuitStore.getState().present.numQubits).toBe(1);
    removeQubit(); // cannot go below 1
    expect(useCircuitStore.getState().present.numQubits).toBe(1);
  });

  it('clamps shots at both bounds', () => {
    useCircuitStore.getState().setShots(-5);
    expect(useCircuitStore.getState().shots).toBe(1);
    useCircuitStore.getState().setShots(1e9);
    expect(useCircuitStore.getState().shots).toBe(100000);
  });

  it('moves an op to a new column and qubit', () => {
    const { addOp, moveOp } = useCircuitStore.getState();
    addOp({ gate: 'H', qubits: [0], column: 0 });
    const id = useCircuitStore.getState().present.ops[0].id;
    moveOp(id, 2, 1);
    const moved = useCircuitStore.getState().present.ops[0];
    expect(moved.column).toBe(2);
    expect(moved.qubits[0]).toBe(1);
  });

  it('edits a parametric op angle', () => {
    const { addOp, setParam } = useCircuitStore.getState();
    addOp({ gate: 'RX', qubits: [0], column: 0, param: 0 });
    const id = useCircuitStore.getState().present.ops[0].id;
    setParam(id, Math.PI);
    expect(useCircuitStore.getState().present.ops[0].param).toBeCloseTo(Math.PI);
  });

  it('setCircuit can skip history, and select tracks selection', () => {
    const { setCircuit, select } = useCircuitStore.getState();
    setCircuit({ numQubits: 3, ops: [] }, false);
    expect(useCircuitStore.getState().present.numQubits).toBe(3);
    expect(useCircuitStore.getState().canUndo()).toBe(false);
    select('abc');
    expect(useCircuitStore.getState().selectedOpId).toBe('abc');
  });

  it('canRedo reflects the future stack', () => {
    const { addOp, undo } = useCircuitStore.getState();
    addOp({ gate: 'X', qubits: [0], column: 0 });
    expect(useCircuitStore.getState().canRedo()).toBe(false);
    undo();
    expect(useCircuitStore.getState().canRedo()).toBe(true);
  });
});

import { create } from 'zustand';
import { Circuit, CircuitOp, emptyCircuit, makeOpId } from '@/quantum/circuit';
import { reflow } from '@/quantum/algorithms';

interface HistoryState {
  past: Circuit[];
  present: Circuit;
  future: Circuit[];
}

interface CircuitStore extends HistoryState {
  shots: number;
  selectedOpId: string | null;
  setShots: (n: number) => void;
  select: (id: string | null) => void;
  setCircuit: (c: Circuit, recordHistory?: boolean) => void;
  addOp: (op: Omit<CircuitOp, 'id'>) => void;
  removeOp: (id: string) => void;
  moveOp: (id: string, column: number, qubit: number) => void;
  duplicateOp: (id: string) => void;
  setParam: (id: string, param: number) => void;
  addQubit: () => void;
  removeQubit: () => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const LIMIT = 100;

function commit(state: HistoryState, next: Circuit): HistoryState {
  return {
    past: [...state.past, state.present].slice(-LIMIT),
    present: next,
    future: [],
  };
}

export const useCircuitStore = create<CircuitStore>((set, get) => ({
  past: [],
  present: emptyCircuit(2),
  future: [],
  shots: 1024,
  selectedOpId: null,

  setShots: (n) => set({ shots: Math.max(1, Math.min(100000, Math.round(n))) }),
  select: (id) => set({ selectedOpId: id }),

  setCircuit: (c, recordHistory = true) =>
    set((s) => (recordHistory ? { ...commit(s, c), selectedOpId: null } : { present: c })),

  addOp: (op) =>
    set((s) => {
      const newOp: CircuitOp = { ...op, id: makeOpId() };
      return { ...commit(s, { ...s.present, ops: [...s.present.ops, newOp] }), selectedOpId: newOp.id };
    }),

  removeOp: (id) =>
    set((s) =>
      commit(s, { ...s.present, ops: s.present.ops.filter((o) => o.id !== id) }),
    ),

  moveOp: (id, column, qubit) =>
    set((s) => {
      const ops = s.present.ops.map((o) => {
        if (o.id !== id) return o;
        const delta = qubit - o.qubits[0];
        const qubits = o.qubits.map((q) => Math.max(0, Math.min(s.present.numQubits - 1, q + delta)));
        return { ...o, column: Math.max(0, column), qubits };
      });
      return commit(s, { ...s.present, ops });
    }),

  duplicateOp: (id) =>
    set((s) => {
      const src = s.present.ops.find((o) => o.id === id);
      if (!src) return s;
      const copy: CircuitOp = { ...src, id: makeOpId(), column: src.column + 1 };
      return { ...commit(s, { ...s.present, ops: [...s.present.ops, copy] }), selectedOpId: copy.id };
    }),

  setParam: (id, param) =>
    set((s) =>
      commit(s, {
        ...s.present,
        ops: s.present.ops.map((o) => (o.id === id ? { ...o, param } : o)),
      }),
    ),

  addQubit: () =>
    set((s) =>
      s.present.numQubits >= 8
        ? s
        : commit(s, { ...s.present, numQubits: s.present.numQubits + 1 }),
    ),

  removeQubit: () =>
    set((s) => {
      if (s.present.numQubits <= 1) return s;
      const n = s.present.numQubits - 1;
      const ops = s.present.ops.filter((o) => o.qubits.every((q) => q < n));
      return commit(s, reflow({ numQubits: n, ops }));
    }),

  clear: () => set((s) => commit(s, emptyCircuit(s.present.numQubits))),

  undo: () =>
    set((s) => {
      if (!s.past.length) return s;
      const previous = s.past[s.past.length - 1];
      return {
        past: s.past.slice(0, -1),
        present: previous,
        future: [s.present, ...s.future].slice(0, LIMIT),
      };
    }),

  redo: () =>
    set((s) => {
      if (!s.future.length) return s;
      const next = s.future[0];
      return {
        past: [...s.past, s.present].slice(-LIMIT),
        present: next,
        future: s.future.slice(1),
      };
    }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));

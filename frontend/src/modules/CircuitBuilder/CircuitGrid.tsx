import { useState } from 'react';
import { useCircuitStore } from '@/store/useCircuitStore';
import { maxColumn } from '@/quantum/circuit';
import { GATE_CATALOGUE, isParametric } from '@/quantum/gates';
import { cn } from '@/lib/cn';

const CELL = 56;
const LABEL_W = 56;

function gateColor(id: string): string {
  return GATE_CATALOGUE.find((g) => g.id === id)?.color ?? '#64748b';
}

/**
 * The interactive circuit canvas. Wires are rows, time-slices are columns.
 * Gates are dropped from the palette, dragged to reposition, and clicked to
 * select (for parameter editing / deletion).
 */
export function CircuitGrid() {
  const { present, addOp, moveOp, removeOp, duplicateOp, select, selectedOpId } = useCircuitStore();
  const [dragOpId, setDragOpId] = useState<string | null>(null);
  const columns = Math.max(maxColumn(present) + 2, 6);

  const onDropCell = (e: React.DragEvent, column: number, qubit: number) => {
    e.preventDefault();
    const gate = e.dataTransfer.getData('text/gate');
    if (gate) {
      const twoQubit = gate === 'CX' || gate === 'CZ' || gate === 'SWAP';
      const qubits = twoQubit
        ? [qubit, qubit + 1 < present.numQubits ? qubit + 1 : qubit - 1]
        : [qubit];
      addOp({ gate, qubits, column, param: isParametric(gate) ? Math.PI / 2 : undefined });
    } else if (dragOpId) {
      moveOp(dragOpId, column, qubit);
      setDragOpId(null);
    }
  };

  return (
    <div className="scrollbar-thin overflow-x-auto pb-2">
      <div
        className="relative"
        style={{ width: LABEL_W + columns * CELL, height: present.numQubits * CELL }}
      >
        {/* wires */}
        {Array.from({ length: present.numQubits }).map((_, q) => (
          <div key={q}>
            <div
              className="absolute flex items-center justify-center mono text-xs text-slate-400"
              style={{ left: 0, top: q * CELL, width: LABEL_W, height: CELL }}
            >
              q{q}
            </div>
            <div
              className="absolute bg-white/15"
              style={{ left: LABEL_W, top: q * CELL + CELL / 2, width: columns * CELL, height: 1 }}
            />
          </div>
        ))}

        {/* drop cells */}
        {Array.from({ length: columns }).map((_, c) =>
          Array.from({ length: present.numQubits }).map((_, q) => (
            <div
              key={`${c}-${q}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDropCell(e, c, q)}
              className="absolute rounded-md transition-colors hover:bg-white/[0.04]"
              style={{ left: LABEL_W + c * CELL, top: q * CELL, width: CELL, height: CELL }}
            />
          )),
        )}

        {/* ops */}
        {present.ops.map((op) => {
          const baseQ = op.qubits[0];
          const isTwo = op.qubits.length === 2;
          const color = gateColor(op.gate);
          const left = LABEL_W + op.column * CELL;

          if (isTwo && op.gate !== 'SWAP') {
            const [control, target] = op.qubits;
            const top = Math.min(control, target) * CELL;
            const span = (Math.abs(control - target) + 1) * CELL;
            return (
              <div key={op.id} className="absolute" style={{ left, top, width: CELL, height: span }}>
                {/* vertical link */}
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{ top: CELL / 2, height: span - CELL, width: 2, background: color }}
                />
                {/* control dot */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    top: (control - Math.min(control, target)) * CELL + CELL / 2 - 5,
                    width: 10,
                    height: 10,
                    background: color,
                  }}
                />
                {/* target */}
                <div
                  draggable
                  onDragStart={() => setDragOpId(op.id)}
                  onClick={() => select(op.id)}
                  className={cn(
                    'absolute left-1/2 flex -translate-x-1/2 cursor-grab items-center justify-center rounded-full border-2 font-mono text-xs',
                    selectedOpId === op.id && 'ring-2 ring-white',
                  )}
                  style={{
                    top: (target - Math.min(control, target)) * CELL + CELL / 2 - 14,
                    width: 28,
                    height: 28,
                    borderColor: color,
                    color,
                  }}
                >
                  {op.gate === 'CX' ? '⊕' : 'Z'}
                </div>
              </div>
            );
          }

          if (op.gate === 'SWAP') {
            const [a, b] = op.qubits;
            const top = Math.min(a, b) * CELL;
            const span = (Math.abs(a - b) + 1) * CELL;
            return (
              <div key={op.id} className="absolute" style={{ left, top, width: CELL, height: span }}>
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{ top: CELL / 2, height: span - CELL, width: 2, background: color }}
                />
                {[a, b].map((qq) => (
                  <div
                    key={qq}
                    onClick={() => select(op.id)}
                    className="absolute left-1/2 -translate-x-1/2 cursor-pointer text-lg font-bold"
                    style={{ top: (qq - Math.min(a, b)) * CELL + CELL / 2 - 12, color }}
                  >
                    ✕
                  </div>
                ))}
              </div>
            );
          }

          // single-qubit gate / measure
          return (
            <div
              key={op.id}
              draggable
              onDragStart={() => setDragOpId(op.id)}
              onClick={() => select(op.id)}
              className={cn(
                'gate-tile absolute cursor-grab',
                selectedOpId === op.id && 'ring-2 ring-white',
              )}
              style={{
                left: left + (CELL - 40) / 2,
                top: baseQ * CELL + (CELL - 40) / 2,
                width: 40,
                height: 40,
                background: op.gate === 'M' ? '#334155' : color,
              }}
              title={isParametric(op.gate) ? `${op.gate}(${(op.param ?? 0).toFixed(2)})` : op.gate}
            >
              {op.gate === 'M' ? '⊿' : op.gate}
            </div>
          );
        })}
      </div>

      {selectedOpId && (
        <div className="mt-2 flex items-center gap-2">
          <button className="btn-outline" onClick={() => duplicateOp(selectedOpId)}>
            Duplicate
          </button>
          <button className="btn-outline text-quantum-magenta" onClick={() => removeOp(selectedOpId)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

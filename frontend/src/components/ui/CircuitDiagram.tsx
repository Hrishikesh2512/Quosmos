import { Circuit, maxColumn } from '@/quantum/circuit';
import { GATE_CATALOGUE } from '@/quantum/gates';
import { cn } from '@/lib/cn';

const CELL = 46;
const LABEL = 40;

function color(id: string): string {
  return GATE_CATALOGUE.find((g) => g.id === id)?.color ?? '#64748b';
}

/** Read-only circuit renderer with optional column highlighting for animation. */
export function CircuitDiagram({
  circuit,
  highlight = [],
}: {
  circuit: Circuit;
  highlight?: number[];
}) {
  const columns = maxColumn(circuit) + 1;
  const width = LABEL + Math.max(columns, 1) * CELL;
  const height = circuit.numQubits * CELL;

  return (
    <div className="scrollbar-thin overflow-x-auto">
      <svg width={width} height={height} className="block">
        {Array.from({ length: circuit.numQubits }).map((_, q) => (
          <g key={q}>
            <text x={4} y={q * CELL + CELL / 2 + 4} className="fill-slate-400" fontSize={12} fontFamily="monospace">
              q{q}
            </text>
            <line x1={LABEL} y1={q * CELL + CELL / 2} x2={width} y2={q * CELL + CELL / 2} stroke="rgba(255,255,255,0.15)" />
          </g>
        ))}

        {highlight.map((c) => (
          <rect
            key={`hl-${c}`}
            x={LABEL + c * CELL}
            y={0}
            width={CELL}
            height={height}
            fill="rgba(124,138,255,0.12)"
            rx={6}
          />
        ))}

        {circuit.ops.map((op) => {
          const x = LABEL + op.column * CELL + CELL / 2;
          const c = color(op.gate);
          if (op.qubits.length === 2 && op.gate !== 'SWAP') {
            const [ctrl, tgt] = op.qubits;
            const yc = ctrl * CELL + CELL / 2;
            const yt = tgt * CELL + CELL / 2;
            return (
              <g key={op.id}>
                <line x1={x} y1={yc} x2={x} y2={yt} stroke={c} strokeWidth={2} />
                <circle cx={x} cy={yc} r={5} fill={c} />
                <circle cx={x} cy={yt} r={12} fill="none" stroke={c} strokeWidth={2} />
                <text x={x} y={yt + 4} textAnchor="middle" fontSize={12} fill={c} fontFamily="monospace">
                  {op.gate === 'CX' ? '+' : 'Z'}
                </text>
              </g>
            );
          }
          if (op.gate === 'SWAP') {
            const [a, b] = op.qubits;
            return (
              <g key={op.id}>
                <line x1={x} y1={a * CELL + CELL / 2} x2={x} y2={b * CELL + CELL / 2} stroke={c} strokeWidth={2} />
                {[a, b].map((qq) => (
                  <text key={qq} x={x} y={qq * CELL + CELL / 2 + 5} textAnchor="middle" fontSize={14} fill={c}>
                    ✕
                  </text>
                ))}
              </g>
            );
          }
          const y = op.qubits[0] * CELL + CELL / 2;
          return (
            <g key={op.id}>
              <rect
                x={x - 15}
                y={y - 15}
                width={30}
                height={30}
                rx={7}
                fill={op.gate === 'M' ? '#334155' : c}
              />
              <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontFamily="monospace" className={cn('fill-white font-semibold')}>
                {op.gate === 'M' ? 'M' : op.gate}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

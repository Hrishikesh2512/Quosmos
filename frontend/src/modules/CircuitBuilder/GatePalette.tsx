import { GATE_CATALOGUE } from '@/quantum/gates';

/** Draggable palette of gates. Dragging carries the gate id via dataTransfer. */
export function GatePalette() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {GATE_CATALOGUE.map((g) => (
        <div
          key={g.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/gate', g.id);
            e.dataTransfer.effectAllowed = 'copy';
          }}
          title={g.description}
          className="gate-tile cursor-grab active:cursor-grabbing"
          style={{ background: g.color }}
        >
          {g.label}
        </div>
      ))}
    </div>
  );
}

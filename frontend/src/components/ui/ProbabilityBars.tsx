import { cn } from '@/lib/cn';

interface Bar {
  label: string;
  value: number;
  color?: string;
}

/** Horizontal probability bars with smooth width transitions. */
export function ProbabilityBars({ bars, suffix = '%' }: { bars: Bar[]; suffix?: string }) {
  return (
    <div className="space-y-2">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-3">
          <span className="mono w-16 shrink-0 text-xs text-slate-300">{b.label}</span>
          <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-white/5">
            <div
              className={cn('absolute inset-y-0 left-0 rounded-md transition-all duration-500 ease-out')}
              style={{
                width: `${Math.max(0, Math.min(100, b.value * 100))}%`,
                background: b.color ?? 'linear-gradient(90deg,#4f5ae0,#22d3ee)',
              }}
            />
          </div>
          <span className="mono w-14 shrink-0 text-right text-xs text-quantum-cyan">
            {(b.value * 100).toFixed(1)}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

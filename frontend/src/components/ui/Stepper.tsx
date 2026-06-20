import { cn } from '@/lib/cn';

export interface Step {
  title: string;
  detail: string;
}

export function Stepper({
  steps,
  current,
  onSelect,
}: {
  steps: Step[];
  current: number;
  onSelect?: (i: number) => void;
}) {
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={i}>
            <button
              onClick={() => onSelect?.(i)}
              disabled={!onSelect}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all',
                active
                  ? 'border-nebula-400/60 bg-nebula-500/15 shadow-glow'
                  : done
                    ? 'border-quantum-emerald/30 bg-quantum-emerald/5'
                    : 'border-white/10 bg-white/[0.02] opacity-70',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  active
                    ? 'bg-nebula-400 text-white animate-pulse-glow'
                    : done
                      ? 'bg-quantum-emerald text-black'
                      : 'bg-white/10 text-slate-400',
                )}
              >
                {done ? '✓' : i + 1}
              </span>
              <div>
                <div className={cn('text-sm font-medium', active ? 'text-white' : 'text-slate-300')}>
                  {s.title}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">{s.detail}</div>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

import { StateVector, indexToBitstring } from '@/quantum/statevector';
import { cn } from '@/lib/cn';

/** Amplitude table with magnitude bars and phase dials. */
export function StateVectorView({ state, eps = 1e-6 }: { state: StateVector; eps?: number }) {
  const rows = state.amplitudes
    .map((amp, i) => ({ i, amp, prob: amp.abs2() }))
    .filter((r) => r.prob > eps);

  return (
    <div className="space-y-1.5">
      {rows.map((r) => {
        const phase = r.amp.phase();
        return (
          <div key={r.i} className="flex items-center gap-3">
            <span className="mono w-16 shrink-0 text-xs text-slate-300">
              |{indexToBitstring(r.i, state.numQubits)}⟩
            </span>
            <div className="relative h-4 flex-1 overflow-hidden rounded bg-white/5">
              <div
                className="absolute inset-y-0 left-0 rounded transition-all duration-500"
                style={{
                  width: `${Math.sqrt(r.prob) * 100}%`,
                  background: 'linear-gradient(90deg,#4f5ae0,#22d3ee)',
                }}
              />
            </div>
            <span className="mono w-28 shrink-0 text-right text-[11px] text-slate-400">
              {r.amp.toString()}
            </span>
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full"
              title={`phase ${(phase / Math.PI).toFixed(2)}π`}
              style={{
                background: `conic-gradient(from ${phase}rad, #f472b6, #22d3ee, #a78bfa, #f472b6)`,
                transform: `rotate(${phase}rad)`,
              }}
            />
          </div>
        );
      })}
      {rows.length === 0 && <div className={cn('text-sm text-slate-500')}>Zero state.</div>}
    </div>
  );
}

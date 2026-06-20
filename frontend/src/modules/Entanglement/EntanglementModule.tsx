import { useEffect, useMemo, useState } from 'react';
import { Panel, Stat, SegmentedControl } from '@/components/ui/Primitives';
import { StateVectorView } from '@/components/ui/StateVectorView';
import { CountsChart } from '@/components/ui/CountsChart';
import { Math as TeX } from '@/components/ui/Math';
import { statevectorOf } from '@/quantum/circuit';
import { bellVariant } from '@/quantum/algorithms';

const BELL_LABELS = ['Φ⁺', 'Ψ⁺', 'Φ⁻', 'Ψ⁻'];
const BELL_TEX = [
  '|\\Phi^+\\rangle = \\tfrac{1}{\\sqrt2}(|00\\rangle + |11\\rangle)',
  '|\\Psi^+\\rangle = \\tfrac{1}{\\sqrt2}(|01\\rangle + |10\\rangle)',
  '|\\Phi^-\\rangle = \\tfrac{1}{\\sqrt2}(|00\\rangle - |11\\rangle)',
  '|\\Psi^-\\rangle = \\tfrac{1}{\\sqrt2}(|01\\rangle - |10\\rangle)',
];

export function EntanglementModule() {
  const [variant, setVariant] = useState<0 | 1 | 2 | 3>(0);
  const [shots, setShots] = useState(512);
  const [outcomes, setOutcomes] = useState<string[]>([]);

  const circuit = useMemo(() => bellVariant(variant), [variant]);
  const state = useMemo(() => statevectorOf(circuit), [circuit]);

  // Pearson correlation of the two measured bits (Z basis).
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    let agree = 0;
    const samples: string[] = [];
    for (let i = 0; i < shots; i++) {
      const s = state.sample();
      counts[s] = (counts[s] ?? 0) + 1;
      if (s[0] === s[1]) agree++;
      if (samples.length < 60) samples.push(s);
    }
    const correlation = (2 * agree) / shots - 1; // +1 perfectly correlated, -1 anti
    return { counts, correlation, agreePct: (agree / shots) * 100, samples };
  }, [state, shots]);

  useEffect(() => {
    setOutcomes(stats.samples);
  }, [stats]);

  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <Panel title="Bell State" subtitle="The four maximally-entangled two-qubit states">
          <SegmentedControl
            value={String(variant)}
            onChange={(v) => setVariant(Number(v) as 0 | 1 | 2 | 3)}
            options={BELL_LABELS.map((l, i) => ({ value: String(i), label: l }))}
          />
          <div className="mt-4 panel bg-black/20 p-4">
            <TeX tex={BELL_TEX[variant]} display />
          </div>
          <div className="mt-4">
            <div className="label mb-2">Statevector</div>
            <StateVectorView state={state} />
          </div>
        </Panel>

        <Panel title="What this means">
          <p className="text-sm leading-relaxed text-slate-300">
            Each qubit alone is completely random — 50/50. Yet their outcomes are perfectly linked.
            Measuring one instantly fixes the statistics of the other. This correlation is the
            resource behind teleportation and superdense coding.
          </p>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel
          title="Correlation statistics"
          subtitle="Sampled measurements in the Z basis"
          actions={
            <SegmentedControl
              value={String(shots)}
              onChange={(v) => setShots(Number(v))}
              options={[128, 512, 2048].map((n) => ({ value: String(n), label: String(n) }))}
            />
          }
        >
          <div className="grid grid-cols-3 gap-2">
            <Stat
              label="Correlation"
              value={stats.correlation.toFixed(3)}
              accent={stats.correlation >= 0 ? 'text-quantum-emerald' : 'text-quantum-magenta'}
            />
            <Stat label="Agreement" value={`${stats.agreePct.toFixed(1)}%`} accent="text-quantum-cyan" />
            <Stat label="Shots" value={shots} />
          </div>
          <div className="mt-3">
            <CountsChart counts={stats.counts} />
          </div>
        </Panel>

        <Panel title="Outcome stream" subtitle="Live measurement results">
          <div className="flex flex-wrap gap-1.5">
            {outcomes.map((o, i) => (
              <span
                key={i}
                className="mono rounded px-2 py-1 text-xs"
                style={{
                  background: o[0] === o[1] ? 'rgba(52,211,153,0.15)' : 'rgba(244,114,182,0.15)',
                  color: o[0] === o[1] ? '#34d399' : '#f472b6',
                }}
              >
                {o[0]}
                {o[1]}
              </span>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

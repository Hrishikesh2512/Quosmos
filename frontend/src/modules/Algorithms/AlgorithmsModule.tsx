import { useMemo, useState } from 'react';
import { Panel, Button, SegmentedControl } from '@/components/ui/Primitives';
import { CircuitDiagram } from '@/components/ui/CircuitDiagram';
import { StateVectorView } from '@/components/ui/StateVectorView';
import { CountsChart } from '@/components/ui/CountsChart';
import { Math as TeX } from '@/components/ui/Math';
import { ShorView } from './ShorView';
import { Circuit } from '@/quantum/circuit';
import { statevectorOf, measureStatistics } from '@/quantum/circuit';
import { ALGORITHM_STEPS, deutschJozsa, grover2, qft } from '@/quantum/algorithms';

type AlgoId = 'deutsch-jozsa' | 'grover' | 'qft' | 'shor';

const TABS: { id: AlgoId; label: string }[] = [
  { id: 'deutsch-jozsa', label: 'Deutsch–Jozsa' },
  { id: 'grover', label: 'Grover' },
  { id: 'qft', label: 'QFT' },
  { id: 'shor', label: 'Shor' },
];

function CircuitAlgo({ algo }: { algo: AlgoId }) {
  const [oracle, setOracle] = useState<'constant0' | 'constant1' | 'balanced'>('balanced');
  const [step, setStep] = useState(0);

  const circuit: Circuit = useMemo(() => {
    if (algo === 'deutsch-jozsa') return deutschJozsa(3, oracle);
    if (algo === 'grover') return grover2();
    return qft(3);
  }, [algo, oracle]);

  const state = useMemo(() => statevectorOf(circuit), [circuit]);
  const counts = useMemo(() => measureStatistics(circuit, 1024), [circuit]);
  const steps = ALGORITHM_STEPS[algo] ?? [];
  const current = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <Panel
          title="Circuit"
          subtitle={current?.title}
          actions={
            algo === 'deutsch-jozsa' ? (
              <SegmentedControl
                value={oracle}
                onChange={(v) => setOracle(v as typeof oracle)}
                options={[
                  { value: 'constant0', label: 'const 0' },
                  { value: 'constant1', label: 'const 1' },
                  { value: 'balanced', label: 'balanced' },
                ]}
              />
            ) : null
          }
        >
          <CircuitDiagram circuit={circuit} highlight={current?.highlightColumns ?? []} />
        </Panel>

        <Panel
          title="Step-by-step"
          actions={
            <div className="flex gap-1">
              <Button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                ←
              </Button>
              <Button variant="primary" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} disabled={step >= steps.length - 1}>
                →
              </Button>
            </div>
          }
        >
          {current && (
            <div className="animate-fade-in">
              <div className="text-sm font-medium text-white">{current.title}</div>
              <p className="mt-1 text-sm text-slate-300">{current.description}</p>
              <div className="mt-3 panel bg-black/20 p-3">
                <TeX tex={current.math} display />
              </div>
            </div>
          )}
          <div className="mt-3 flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-nebula-400' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel title="Statevector">
          <StateVectorView state={state} />
        </Panel>
        <Panel title="Measurement outcome">
          <CountsChart counts={counts} />
          {algo === 'deutsch-jozsa' && (
            <p className="mt-2 text-sm text-slate-300">
              Result is <span className="mono text-quantum-emerald">all zeros</span> ⇒ constant; anything
              else ⇒ balanced. One query decides it.
            </p>
          )}
          {algo === 'grover' && (
            <p className="mt-2 text-sm text-slate-300">
              The marked state <span className="mono text-quantum-emerald">|11⟩</span> dominates after a
              single Grover iteration.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

export function AlgorithmsModule() {
  const [tab, setTab] = useState<AlgoId>('deutsch-jozsa');
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl value={tab} onChange={(v) => setTab(v as AlgoId)} options={TABS.map((t) => ({ value: t.id, label: t.label }))} />
      </div>
      {tab === 'shor' ? <ShorView /> : <CircuitAlgo algo={tab} />}
    </div>
  );
}

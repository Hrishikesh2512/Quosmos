import { useEffect, useMemo, useState } from 'react';
import { CHALLENGES, Challenge } from '@/content/challenges';
import { useCircuitStore } from '@/store/useCircuitStore';
import { useProgressStore } from '@/store/useProgressStore';
import { GatePalette } from '@/modules/CircuitBuilder/GatePalette';
import { CircuitGrid } from '@/modules/CircuitBuilder/CircuitGrid';
import { Panel, Button, IconButton } from '@/components/ui/Primitives';
import { StateVectorView } from '@/components/ui/StateVectorView';
import { Math as TeX } from '@/components/ui/Math';
import { statevectorOf, emptyCircuit } from '@/quantum/circuit';
import { cn } from '@/lib/cn';

const DIFF_COLOR = {
  beginner: 'text-quantum-emerald',
  intermediate: 'text-quantum-amber',
  advanced: 'text-quantum-magenta',
} as const;

export function ChallengesModule() {
  const [active, setActive] = useState<Challenge | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [status, setStatus] = useState<'idle' | 'pass' | 'fail'>('idle');

  const { present, setCircuit, clear, undo, redo } = useCircuitStore();
  const { isComplete, complete, recordHint } = useProgressStore();

  const completedCount = CHALLENGES.filter((c) => isComplete(c.id)).length;
  const state = useMemo(() => statevectorOf(present), [present]);

  const start = (c: Challenge) => {
    setActive(c);
    setRevealed(0);
    setStatus('idle');
    setCircuit(emptyCircuit(c.numQubits));
  };

  useEffect(() => {
    setStatus('idle');
  }, [present]);

  const check = () => {
    if (!active) return;
    const ok = active.validate(present);
    setStatus(ok ? 'pass' : 'fail');
    if (ok) complete(active.id);
  };

  if (!active) {
    return (
      <div className="space-y-4">
        <Panel title="Quantum Challenges" subtitle={`${completedCount} / ${CHALLENGES.length} solved`}>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-quantum-violet to-quantum-cyan transition-all"
              style={{ width: `${(completedCount / CHALLENGES.length) * 100}%` }}
            />
          </div>
        </Panel>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CHALLENGES.map((c) => (
            <button key={c.id} onClick={() => start(c)} className="panel p-4 text-left transition-transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <span className={cn('text-xs font-semibold uppercase tracking-wide', DIFF_COLOR[c.difficulty])}>
                  {c.difficulty}
                </span>
                {isComplete(c.id) && <span className="chip border-quantum-emerald/40 text-quantum-emerald">✓ Solved</span>}
              </div>
              <h3 className="mt-2 text-base font-semibold text-white">{c.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{c.brief}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[280px_1fr_320px]">
      <div className="space-y-4">
        <Panel
          title={active.title}
          actions={
            <IconButton label="Back to list" onClick={() => setActive(null)}>
              ←
            </IconButton>
          }
        >
          <span className={cn('text-xs font-semibold uppercase', DIFF_COLOR[active.difficulty])}>
            {active.difficulty}
          </span>
          <p className="mt-2 text-sm text-slate-300">{active.brief}</p>
          <div className="mt-3 panel bg-black/20 p-3 text-sm text-quantum-cyan">{active.goal}</div>
        </Panel>

        <Panel title="Gate Palette">
          <GatePalette />
        </Panel>

        <Panel
          title="Hints"
          actions={
            <Button
              onClick={() => {
                if (revealed < active.hints.length) {
                  setRevealed((r) => r + 1);
                  recordHint(active.id);
                }
              }}
              disabled={revealed >= active.hints.length}
            >
              Reveal
            </Button>
          }
        >
          {revealed === 0 && <p className="text-sm text-slate-500">No hints used yet. You’ve got this!</p>}
          <ol className="space-y-2">
            {active.hints.slice(0, revealed).map((h, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-quantum-amber">💡</span>
                {h}
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel
        title="Your circuit"
        subtitle="Drag gates onto the wires to build your solution"
        actions={
          <>
            <IconButton label="Undo" onClick={undo}>↶</IconButton>
            <IconButton label="Redo" onClick={redo}>↷</IconButton>
            <IconButton label="Clear" onClick={clear}>🗑</IconButton>
          </>
        }
      >
        <CircuitGrid />
        <div className="mt-4 flex items-center gap-3">
          <Button variant="primary" onClick={check}>
            ✓ Validate
          </Button>
          {status === 'pass' && (
            <span className="chip animate-fade-in border-quantum-emerald/40 text-quantum-emerald">
              🎉 Correct! Challenge solved.
            </span>
          )}
          {status === 'fail' && (
            <span className="chip animate-fade-in border-quantum-magenta/40 text-quantum-magenta">
              Not yet - check the target state.
            </span>
          )}
        </div>
      </Panel>

      <Panel title="Live statevector">
        <StateVectorView state={state} />
        <div className="mt-3 panel bg-black/20 p-3">
          <TeX tex={`|\\psi\\rangle = ${state.toDirac()}`} display />
        </div>
      </Panel>
    </div>
  );
}

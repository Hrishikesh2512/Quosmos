import { useMemo, useState } from 'react';
import { BlochScene } from './BlochScene';
import { Panel, Button, Slider, Stat, IconButton } from '@/components/ui/Primitives';
import { ProbabilityBars } from '@/components/ui/ProbabilityBars';
import { Math as TeX } from '@/components/ui/Math';
import { StateVector } from '@/quantum/statevector';
import { stateToQubit, toBloch, qubitProbabilities, blochToAngles } from '@/quantum/bloch';
import { GATES } from '@/quantum/gates';
import { downloadScreenshot } from '@/lib/download';

type FixedGate = 'X' | 'Y' | 'Z' | 'H' | 'S' | 'T';
const FIXED: FixedGate[] = ['X', 'Y', 'Z', 'H', 'S', 'T'];

interface HistoryEntry {
  gate: string;
  state: StateVector;
}

export function BlochSphereModule() {
  const [state, setState] = useState<StateVector>(() => StateVector.zero(1));
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [angle, setAngle] = useState(Math.PI / 2);

  const qubit = useMemo(() => stateToQubit(state), [state]);
  const bloch = useMemo(() => toBloch(qubit), [qubit]);
  const { p0, p1 } = useMemo(() => qubitProbabilities(qubit), [qubit]);
  const angles = useMemo(() => blochToAngles(bloch), [bloch]);

  const applyFixed = (g: FixedGate) => {
    const next = state.applySingle(GATES[g], 0);
    setHistory((h) => [...h, { gate: g, state }]);
    setState(next);
  };

  const applyRot = (axis: 'RX' | 'RY' | 'RZ') => {
    const next = state.applyGate(axis, 0, angle);
    setHistory((h) => [...h, { gate: `${axis}(${angle.toFixed(2)})`, state }]);
    setState(next);
  };

  const undo = () => {
    setHistory((h) => {
      if (!h.length) return h;
      const last = h[h.length - 1];
      setState(last.state);
      return h.slice(0, -1);
    });
  };

  const reset = () => {
    setState(StateVector.zero(1));
    setHistory([]);
  };

  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
      <Panel
        title="Bloch Sphere"
        subtitle="Drag to rotate · scroll to zoom · right-drag to pan"
        className="min-h-[420px]"
        actions={
          <>
            <IconButton label="Reset" onClick={reset}>
              ⟲
            </IconButton>
            <IconButton
              label="Screenshot"
              onClick={(e) => downloadScreenshot(e.currentTarget.closest('section')!, 'bloch.png')}
            >
              📷
            </IconButton>
          </>
        }
      >
        <div className="h-[460px] overflow-hidden rounded-xl">
          <BlochScene vector={bloch} />
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel title="Gates" subtitle="Apply a gate to watch the state vector rotate">
          <div className="mb-3 grid grid-cols-6 gap-2">
            {FIXED.map((g) => (
              <button
                key={g}
                onClick={() => applyFixed(g)}
                className="gate-tile bg-gradient-to-br from-nebula-500 to-nebula-700"
              >
                {g}
              </button>
            ))}
          </div>
          <Slider
            label="Rotation angle θ"
            value={angle}
            min={0}
            max={Math.PI * 2}
            step={0.01}
            display={`${(angle / Math.PI).toFixed(2)}π`}
            onChange={setAngle}
          />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(['RX', 'RY', 'RZ'] as const).map((g) => (
              <Button key={g} onClick={() => applyRot(g)} variant="outline">
                {g}
              </Button>
            ))}
          </div>
        </Panel>

        <Panel title="Probabilities">
          <ProbabilityBars
            bars={[
              { label: '|0⟩', value: p0, color: 'linear-gradient(90deg,#22d3ee,#34d399)' },
              { label: '|1⟩', value: p1, color: 'linear-gradient(90deg,#a78bfa,#f472b6)' },
            ]}
          />
        </Panel>

        <Panel title="State">
          <div className="mb-3 grid grid-cols-3 gap-2">
            <Stat label="θ" value={`${(angles.theta / Math.PI).toFixed(3)}π`} accent="text-quantum-cyan" />
            <Stat label="φ" value={`${(angles.phi / Math.PI).toFixed(3)}π`} accent="text-quantum-violet" />
            <Stat label="|ψ|" value={Math.hypot(bloch.x, bloch.y, bloch.z).toFixed(3)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="x" value={bloch.x.toFixed(3)} accent="text-quantum-magenta" />
            <Stat label="y" value={bloch.y.toFixed(3)} accent="text-quantum-emerald" />
            <Stat label="z" value={bloch.z.toFixed(3)} accent="text-quantum-cyan" />
          </div>
          <div className="mt-3 panel bg-black/20 p-3">
            <div className="label mb-1">Amplitudes</div>
            <TeX
              tex={`|\\psi\\rangle = (${qubit.alpha.toString()})\\,|0\\rangle + (${qubit.beta.toString()})\\,|1\\rangle`}
              display
            />
          </div>
        </Panel>

        {history.length > 0 && (
          <Panel
            title="Applied gates"
            actions={
              <IconButton label="Undo" onClick={undo}>
                ↶
              </IconButton>
            }
          >
            <div className="flex flex-wrap gap-1.5">
              {history.map((h, i) => (
                <span key={i} className="chip mono">
                  {h.gate}
                </span>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

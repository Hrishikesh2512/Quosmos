import { useMemo, useState } from 'react';
import { BlochScene } from '@/modules/BlochSphere/BlochScene';
import { Panel, Slider, Stat, Button } from '@/components/ui/Primitives';
import { ProbabilityBars } from '@/components/ui/ProbabilityBars';
import { Math as TeX } from '@/components/ui/Math';
import { fromAngles, toBloch, qubitProbabilities, qubitToState } from '@/quantum/bloch';

const PRESETS: { name: string; theta: number; phi: number }[] = [
  { name: '|0⟩', theta: 0, phi: 0 },
  { name: '|1⟩', theta: Math.PI, phi: 0 },
  { name: '|+⟩', theta: Math.PI / 2, phi: 0 },
  { name: '|−⟩', theta: Math.PI / 2, phi: Math.PI },
  { name: '|+i⟩', theta: Math.PI / 2, phi: Math.PI / 2 },
  { name: '|−i⟩', theta: Math.PI / 2, phi: (3 * Math.PI) / 2 },
];

export function QubitSandboxModule() {
  const [theta, setTheta] = useState(Math.PI / 3);
  const [phi, setPhi] = useState(Math.PI / 4);

  const qubit = useMemo(() => fromAngles(theta, phi), [theta, phi]);
  const bloch = useMemo(() => toBloch(qubit), [qubit]);
  const { p0, p1 } = useMemo(() => qubitProbabilities(qubit), [qubit]);
  const dirac = useMemo(() => qubitToState(qubit).toDirac(), [qubit]);

  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
      <Panel title="Live State" subtitle="Adjust θ and φ — everything updates in real time" className="min-h-[420px]">
        <div className="h-[460px] overflow-hidden rounded-xl">
          <BlochScene vector={bloch} />
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel title="Presets">
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.name}
                onClick={() => {
                  setTheta(p.theta);
                  setPhi(p.phi);
                }}
                className="mono"
              >
                {p.name}
              </Button>
            ))}
          </div>
        </Panel>

        <Panel title="Angles">
          <div className="space-y-4">
            <Slider
              label="θ — polar (|0⟩ ↔ |1⟩)"
              value={theta}
              min={0}
              max={Math.PI}
              display={`${(theta / Math.PI).toFixed(3)}π`}
              onChange={setTheta}
            />
            <Slider
              label="φ — azimuth (phase)"
              value={phi}
              min={0}
              max={Math.PI * 2}
              display={`${(phi / Math.PI).toFixed(3)}π`}
              onChange={setPhi}
            />
          </div>
        </Panel>

        <Panel title="Measurement probabilities">
          <ProbabilityBars
            bars={[
              { label: '|0⟩', value: p0, color: 'linear-gradient(90deg,#22d3ee,#34d399)' },
              { label: '|1⟩', value: p1, color: 'linear-gradient(90deg,#a78bfa,#f472b6)' },
            ]}
          />
        </Panel>

        <Panel title="Representations">
          <div className="space-y-3">
            <div className="panel bg-black/20 p-3">
              <div className="label mb-1">Dirac notation</div>
              <div className="mono text-sm text-quantum-cyan">{dirac}</div>
            </div>
            <div className="panel bg-black/20 p-3">
              <div className="label mb-1">State vector</div>
              <TeX
                tex={`|\\psi\\rangle = \\cos\\tfrac{\\theta}{2}|0\\rangle + e^{i\\phi}\\sin\\tfrac{\\theta}{2}|1\\rangle = (${qubit.alpha.toString()})|0\\rangle + (${qubit.beta.toString()})|1\\rangle`}
                display
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="x" value={bloch.x.toFixed(3)} accent="text-quantum-magenta" />
              <Stat label="y" value={bloch.y.toFixed(3)} accent="text-quantum-emerald" />
              <Stat label="z" value={bloch.z.toFixed(3)} accent="text-quantum-cyan" />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { BlochScene } from '@/modules/BlochSphere/BlochScene';
import { Panel, Button, Slider, Stat } from '@/components/ui/Primitives';
import { Stepper, Step } from '@/components/ui/Stepper';
import { Math as TeX } from '@/components/ui/Math';
import { StateVector } from '@/quantum/statevector';
import { GATES } from '@/quantum/gates';
import { fromAngles, toBloch, BlochVector } from '@/quantum/bloch';
import { Complex } from '@/quantum/complex';

const STEPS: Step[] = [
  { title: 'Prepare source', detail: 'Alice holds an unknown qubit |ψ⟩ on wire 0.' },
  { title: 'Create Bell pair', detail: 'Entangle wires 1 and 2 with H then CX - Alice keeps 1, Bob keeps 2.' },
  { title: 'Bell measurement', detail: 'Alice applies CX(0→1), H(0), then measures wires 0 and 1.' },
  { title: 'Classical send', detail: 'Alice sends the two measured bits to Bob over a classical channel.' },
  { title: 'Reconstruct', detail: 'Bob applies X^{m1} then Z^{m0}. His qubit is now exactly |ψ⟩.' },
];

interface TeleportRun {
  m0: number;
  m1: number;
  bob: BlochVector;
}

/** Deterministically teleport a source qubit and return Bob's Bloch vector. */
function teleport(alpha: Complex, beta: Complex, forced: [0 | 1, 0 | 1]): TeleportRun {
  // 3-qubit state: q0 = source, q1/q2 = Bell pair.
  let s = new StateVector(3, [
    alpha, Complex.ZERO, Complex.ZERO, Complex.ZERO,
    beta, Complex.ZERO, Complex.ZERO, Complex.ZERO,
  ]);
  s = s.applySingle(GATES.H, 1).applyControlled(GATES.X, 1, 2);
  s = s.applyControlled(GATES.X, 0, 1).applySingle(GATES.H, 0);
  const r0 = s.measureQubit(0, forced[0]);
  const r1 = r0.state.measureQubit(1, forced[1]);
  let post = r1.state;
  if (r1.outcome === 1) post = post.applySingle(GATES.X, 2);
  if (r0.outcome === 1) post = post.applySingle(GATES.Z, 2);

  // Extract qubit 2's reduced (pure) state - it is now unentangled.
  let a2 = Complex.ZERO;
  let b2 = Complex.ZERO;
  for (let i = 0; i < 8; i++) {
    const amp = post.amplitudes[i];
    if (amp.abs2() < 1e-12) continue;
    if ((i & 4) === 0) a2 = a2.add(amp);
    else b2 = b2.add(amp);
  }
  const norm = Math.sqrt(a2.abs2() + b2.abs2()) || 1;
  return {
    m0: r0.outcome,
    m1: r1.outcome,
    bob: toBloch({ alpha: a2.scale(1 / norm), beta: b2.scale(1 / norm) }),
  };
}

export function TeleportationModule() {
  const [theta, setTheta] = useState(Math.PI / 3);
  const [phi, setPhi] = useState(Math.PI / 4);
  const [step, setStep] = useState(0);
  const [forced, setForced] = useState<[0 | 1, 0 | 1]>([0, 0]);

  const source = useMemo(() => fromAngles(theta, phi), [theta, phi]);
  const sourceBloch = useMemo(() => toBloch(source), [source]);
  const run = useMemo(() => teleport(source.alpha, source.beta, forced), [source, forced]);

  // Before reconstruction (step < 4) show Bob's qubit as the maximally-mixed origin.
  const bobBloch = step >= 4 ? run.bob : { x: 0, y: 0, z: 0 };
  const fidelity =
    1 -
    0.5 *
      Math.hypot(sourceBloch.x - run.bob.x, sourceBloch.y - run.bob.y, sourceBloch.z - run.bob.z);

  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[1fr_1.2fr]">
      <div className="space-y-4">
        <Panel title="Protocol" subtitle="Move a state with entanglement + 2 classical bits">
          <Stepper steps={STEPS} current={step} onSelect={setStep} />
          <div className="mt-3 flex justify-between">
            <Button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              ← Back
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (step === 1) setForced([Math.random() < 0.5 ? 0 : 1, Math.random() < 0.5 ? 0 : 1]);
                setStep((s) => Math.min(STEPS.length - 1, s + 1));
              }}
              disabled={step === STEPS.length - 1}
            >
              Next →
            </Button>
          </div>
        </Panel>

        <Panel title="Source state |ψ⟩">
          <Slider label="θ" value={theta} min={0} max={Math.PI} display={`${(theta / Math.PI).toFixed(2)}π`} onChange={setTheta} />
          <div className="mt-3">
            <Slider label="φ" value={phi} min={0} max={2 * Math.PI} display={`${(phi / Math.PI).toFixed(2)}π`} onChange={setPhi} />
          </div>
          <div className="mt-3 panel bg-black/20 p-3">
            <TeX tex={`|\\psi\\rangle = (${source.alpha.toString()})|0\\rangle + (${source.beta.toString()})|1\\rangle`} display />
          </div>
        </Panel>

        <Panel title="Classical bits & fidelity">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="m₀" value={step >= 2 ? run.m0 : '-'} accent="text-quantum-cyan" />
            <Stat label="m₁" value={step >= 2 ? run.m1 : '-'} accent="text-quantum-violet" />
            <Stat label="Fidelity" value={step >= 4 ? fidelity.toFixed(3) : '-'} accent="text-quantum-emerald" />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Bob’s correction is{' '}
            <span className="mono text-white">
              Z<sup>{run.m0}</sup>X<sup>{run.m1}</sup>
            </span>
            . Whatever Alice measured, the corrected qubit reproduces |ψ⟩ with fidelity 1.
          </p>
        </Panel>
      </div>

      <div className="grid grid-rows-2 gap-4">
        <Panel title="Alice · source qubit" className="min-h-[260px]">
          <div className="h-[240px] overflow-hidden rounded-xl">
            <BlochScene vector={sourceBloch} />
          </div>
        </Panel>
        <Panel
          title="Bob · reconstructed qubit"
          subtitle={step >= 4 ? 'Reconstruction complete' : 'Awaiting classical bits…'}
          className="min-h-[260px]"
        >
          <div className="h-[240px] overflow-hidden rounded-xl">
            <BlochScene vector={bobBloch} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

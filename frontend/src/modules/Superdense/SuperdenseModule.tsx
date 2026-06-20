import { useMemo, useState } from 'react';
import { Panel, Button, SegmentedControl, Stat } from '@/components/ui/Primitives';
import { Stepper, Step } from '@/components/ui/Stepper';
import { StateVectorView } from '@/components/ui/StateVectorView';
import { Math as TeX } from '@/components/ui/Math';
import { StateVector } from '@/quantum/statevector';
import { GATES } from '@/quantum/gates';

const STEPS: Step[] = [
  { title: 'Share a Bell pair', detail: 'A referee distributes |Φ⁺⟩ - qubit 0 to Alice, qubit 1 to Bob.' },
  { title: 'Choose a message', detail: 'Alice picks two classical bits to send: 00, 01, 10 or 11.' },
  { title: 'Encode', detail: 'Alice applies I, X, Z or ZX to her qubit only.' },
  { title: 'Send the qubit', detail: 'Alice ships her single qubit to Bob.' },
  { title: 'Decode', detail: 'Bob undoes the Bell circuit and measures - recovering both bits.' },
];

const ENCODINGS = ['I', 'X', 'Z', 'ZX'];

/** Build the state at each step for a given 2-bit message. */
function statesFor(message: number): StateVector[] {
  const out: StateVector[] = [];
  let s = StateVector.zero(2);
  out.push(s); // step 0 start
  s = s.applySingle(GATES.H, 0).applyControlled(GATES.X, 0, 1); // Bell pair
  out.push(s); // after share
  out.push(s); // after choose (no state change)
  // encode on Alice's qubit (0)
  if (message & 1) s = s.applySingle(GATES.X, 0);
  if (message & 2) s = s.applySingle(GATES.Z, 0);
  out.push(s); // after encode
  out.push(s); // after send (no change)
  // Bob decodes: CX then H
  s = s.applyControlled(GATES.X, 0, 1).applySingle(GATES.H, 0);
  out.push(s); // after decode
  return out;
}

export function SuperdenseModule() {
  const [message, setMessage] = useState(2);
  const [step, setStep] = useState(0);

  const states = useMemo(() => statesFor(message), [message]);
  // Map the 5 UI steps onto state snapshots.
  const stateIndex = [1, 2, 3, 4, 5][step];
  const state = states[stateIndex];
  const decoded = states[5];
  const recovered = useMemo(() => {
    const probs = decoded.probabilities();
    let best = 0;
    probs.forEach((p, i) => (p > probs[best] ? (best = i) : null));
    return best.toString(2).padStart(2, '0');
  }, [decoded]);

  const messageBits = message.toString(2).padStart(2, '0');

  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[1fr_1.1fr]">
      <div className="space-y-4">
        <Panel title="Protocol" subtitle="Two classical bits delivered by one qubit">
          <Stepper steps={STEPS} current={step} onSelect={setStep} />
          <div className="mt-3 flex justify-between">
            <Button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              ← Back
            </Button>
            <Button variant="primary" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}>
              Next →
            </Button>
          </div>
        </Panel>

        <Panel title="Message to send">
          <SegmentedControl
            value={String(message)}
            onChange={(v) => setMessage(Number(v))}
            options={[0, 1, 2, 3].map((m) => ({
              value: String(m),
              label: m.toString(2).padStart(2, '0'),
            }))}
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat label="Alice encodes" value={ENCODINGS[message]} accent="text-quantum-violet" />
            <Stat label="Bob recovers" value={recovered} accent="text-quantum-emerald" />
          </div>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel title="Quantum state" subtitle={STEPS[step].title}>
          <StateVectorView state={state} />
          <div className="mt-3 panel bg-black/20 p-3">
            <TeX tex={`|\\psi\\rangle = ${state.toDirac()}`} display />
          </div>
        </Panel>

        <Panel title="Circuit timeline">
          <div className="flex items-center justify-between gap-1 text-center">
            {['H·CX', 'msg', ENCODINGS[message], '→ Bob', 'CX·H·M'].map((c, i) => (
              <div key={i} className="flex-1">
                <div
                  className={`mx-auto flex h-12 items-center justify-center rounded-xl border text-xs font-mono transition-all ${
                    i <= step ? 'border-nebula-400/60 bg-nebula-500/20 text-white' : 'border-white/10 text-slate-500'
                  }`}
                >
                  {c}
                </div>
                <div className="mt-1 text-[10px] text-slate-500">step {i + 1}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Alice transmits the 2-bit message <span className="mono text-quantum-cyan">{messageBits}</span> by
            touching <em>only her half</em> of the entangled pair, then sending that single qubit. Bob’s
            measurement deterministically yields{' '}
            <span className="mono text-quantum-emerald">{recovered}</span>.
          </p>
        </Panel>
      </div>
    </div>
  );
}

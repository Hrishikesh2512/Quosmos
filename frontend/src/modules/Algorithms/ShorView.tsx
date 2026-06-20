import { useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Panel, Slider, Stat, SegmentedControl } from '@/components/ui/Primitives';
import { Math as TeX } from '@/components/ui/Math';
import { coprimes, runShor } from '@/quantum/shor';

const SEMIPRIMES = [15, 21, 33, 35, 39];

export function ShorView() {
  const [N, setN] = useState(15);
  const candidates = useMemo(() => coprimes(N), [N]);
  const [a, setA] = useState(7);

  const effectiveA = candidates.includes(a) ? a : candidates[0] ?? 2;
  const result = useMemo(() => runShor(N, effectiveA), [N, effectiveA]);

  const chartData = result.sequence.map((v, x) => ({ x, value: v }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel title="Setup" subtitle="Factor a semiprime N by finding the period of aˣ mod N">
        <div className="mb-3">
          <span className="label">Choose N</span>
          <div className="mt-1">
            <SegmentedControl
              value={String(N)}
              onChange={(v) => setN(Number(v))}
              options={SEMIPRIMES.map((n) => ({ value: String(n), label: String(n) }))}
            />
          </div>
        </div>
        <Slider
          label="Base a (coprime to N)"
          value={effectiveA}
          min={candidates[0] ?? 2}
          max={candidates[candidates.length - 1] ?? N - 1}
          step={1}
          display={String(effectiveA)}
          onChange={(v) => {
            const nearest = candidates.reduce((p, c) => (Math.abs(c - v) < Math.abs(p - v) ? c : p), candidates[0]);
            setA(nearest);
          }}
        />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="N" value={N} accent="text-quantum-cyan" />
          <Stat label="Period r" value={result.period || '-'} accent="text-quantum-violet" />
          <Stat
            label="Factors"
            value={result.factors ? `${result.factors[0]}×${result.factors[1]}` : 'retry'}
            accent="text-quantum-emerald"
          />
        </div>
        <div className="mt-3 panel bg-black/20 p-3">
          <TeX tex={`f(x) = ${effectiveA}^x \\bmod ${N}`} display />
        </div>
      </Panel>

      <Panel title="Periodicity of aˣ mod N" subtitle="The quantum subroutine extracts this period r">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <XAxis dataKey="x" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: 'rgba(5,6,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
            />
            <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: '#a78bfa' }} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Step-by-step" className="lg:col-span-2">
        <ol className="space-y-2">
          {result.steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-300">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-nebula-500/30 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}

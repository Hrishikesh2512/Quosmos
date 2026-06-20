import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#4f5ae0', '#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#f59e0b', '#60a5fa', '#fb7185'];

/** Measurement-counts histogram. */
export function CountsChart({ counts, height = 200 }: { counts: Record<string, number>; height?: number }) {
  const data = Object.entries(counts)
    .map(([state, count]) => ({ state: `|${state}⟩`, count }))
    .sort((a, b) => a.state.localeCompare(b.state));

  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-500">Run the circuit to see counts.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
        <XAxis dataKey="state" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: 'rgba(5,6,15,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            color: '#fff',
          }}
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

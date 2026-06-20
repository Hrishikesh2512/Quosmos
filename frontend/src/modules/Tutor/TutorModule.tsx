import { useState } from 'react';
import { MODULES, ModuleId, useAppStore } from '@/store/useAppStore';
import { TUTOR_CONTENT } from '@/content/tutor';
import { Panel } from '@/components/ui/Primitives';
import { Math as TeX } from '@/components/ui/Math';
import { cn } from '@/lib/cn';

export function TutorModule() {
  const setModule = useAppStore((s) => s.setModule);
  const [topic, setTopic] = useState<ModuleId>('bloch');
  const content = TUTOR_CONTENT[topic];
  const topics = MODULES.filter((m) => m.id !== 'tutor');

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
      <Panel title="Topics">
        <nav className="space-y-1">
          {topics.map((m) => (
            <button
              key={m.id}
              onClick={() => setTopic(m.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors',
                topic === m.id ? 'bg-nebula-500/20 text-white' : 'text-slate-400 hover:bg-white/5',
              )}
            >
              <span>{m.icon}</span>
              <span className="truncate">{m.short}</span>
            </button>
          ))}
        </nav>
      </Panel>

      <div className="space-y-4">
        <Panel title={content.title}>
          <p className="text-base leading-relaxed text-slate-200">{content.summary}</p>
          {content.keyMath && (
            <div className="mt-4 panel bg-black/20 p-4">
              <TeX tex={content.keyMath} display />
            </div>
          )}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {content.points.map((p, i) => (
              <div key={i} className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-300">
                <span className="text-quantum-cyan">▹</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setModule(topic)} className="btn-primary mt-4">
            Open {content.title} →
          </button>
        </Panel>

        {content.faqs.length > 0 && (
          <Panel title="Frequently asked">
            <div className="space-y-3">
              {content.faqs.map((f, i) => (
                <details key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <summary className="cursor-pointer text-sm font-medium text-white">{f.q}</summary>
                  <p className="mt-2 text-sm text-slate-300">{f.a}</p>
                </details>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

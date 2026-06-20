import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Math } from '@/components/ui/Math';
import { TUTOR_CONTENT } from '@/content/tutor';
import { api } from '@/lib/api';

export function TutorPanel() {
  const { tutorOpen, toggleTutor, activeModule, backendOnline } = useAppStore();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const content = TUTOR_CONTENT[activeModule];

  useEffect(() => {
    setAnswer('');
    setQuestion('');
  }, [activeModule]);

  if (!tutorOpen) return null;

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      if (backendOnline) {
        const res = await api.tutor({ module: activeModule, question });
        setAnswer(res.answer);
      } else {
        // Local heuristic answer from the curated knowledge base.
        const hit = content.faqs.find((f) =>
          question.toLowerCase().split(' ').some((w) => w.length > 3 && f.q.toLowerCase().includes(w)),
        );
        setAnswer(
          hit?.a ??
            `Here's the key idea for ${content.title}: ${content.summary} Try the interactive controls on the left — every change updates the math and visuals live.`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-80 shrink-0 flex-col border-l border-white/10 bg-black/30 backdrop-blur-xl">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎓</span>
          <span className="text-sm font-semibold text-white">Quantum Tutor</span>
        </div>
        <button onClick={toggleTutor} className="text-slate-500 hover:text-white">
          ✕
        </button>
      </header>

      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <h4 className="text-sm font-semibold text-gradient">{content.title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">{content.summary}</p>
        </div>

        {content.keyMath && (
          <div className="panel p-3">
            <div className="label mb-1">Key equation</div>
            <Math tex={content.keyMath} display />
          </div>
        )}

        <div className="space-y-2">
          <div className="label">Concepts</div>
          {content.points.map((p, i) => (
            <div key={i} className="flex gap-2 text-sm text-slate-300">
              <span className="text-quantum-cyan">▹</span>
              <span>{p}</span>
            </div>
          ))}
        </div>

        {answer && (
          <div className="panel animate-fade-in p-3 text-sm leading-relaxed text-slate-200">{answer}</div>
        )}
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask()}
            placeholder={`Ask about ${content.title}…`}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-nebula-400"
          />
          <button onClick={ask} disabled={loading} className="btn-primary">
            {loading ? '…' : 'Ask'}
          </button>
        </div>
      </div>
    </div>
  );
}

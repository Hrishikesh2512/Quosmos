import { MODULES, useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/cn';

export function TopBar() {
  const { openTabs, activeModule, setModule, closeTab, toggleTutor, tutorOpen, backendOnline } =
    useAppStore();

  return (
    <header className="flex items-center justify-between gap-2 border-b border-white/10 bg-black/20 px-3 py-2 backdrop-blur-xl">
      <div className="scrollbar-thin flex items-center gap-1 overflow-x-auto">
        {openTabs.map((id) => {
          const m = MODULES.find((x) => x.id === id)!;
          const active = id === activeModule;
          return (
            <div
              key={id}
              className={cn(
                'group flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                active ? 'glass-strong text-white' : 'text-slate-400 hover:bg-white/5',
              )}
            >
              <button onClick={() => setModule(id)} className="flex items-center gap-2">
                <span>{m.icon}</span>
                <span className="whitespace-nowrap">{m.short}</span>
              </button>
              {openTabs.length > 1 && (
                <button
                  onClick={() => closeTab(id)}
                  className="opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
                  aria-label={`Close ${m.short}`}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            'chip',
            backendOnline ? 'border-quantum-emerald/40 text-quantum-emerald' : 'text-slate-500',
          )}
          title={backendOnline ? 'Qiskit backend connected' : 'Running on built-in engine'}
        >
          <span className={cn('h-2 w-2 rounded-full', backendOnline ? 'bg-quantum-emerald' : 'bg-slate-500')} />
          {backendOnline ? 'Qiskit' : 'Local'}
        </span>
        <button
          onClick={toggleTutor}
          className={cn('btn-outline', tutorOpen && 'bg-nebula-500/20 text-white')}
        >
          🎓 Tutor
        </button>
      </div>
    </header>
  );
}

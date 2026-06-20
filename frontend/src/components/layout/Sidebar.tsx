import { MODULES, ModuleMeta, useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/cn';

const GROUPS: { id: ModuleMeta['group']; label: string }[] = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'protocols', label: 'Protocols' },
  { id: 'algorithms', label: 'Algorithms' },
  { id: 'learn', label: 'Learn' },
];

export function Sidebar() {
  const { activeModule, setModule, sidebarCollapsed, toggleSidebar, setCommandPalette } = useAppStore();

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-white/10 bg-black/30 backdrop-blur-xl transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex items-center gap-2 px-4 py-4">
        <img src="/quosmos.svg" alt="" className="h-8 w-8 animate-float" />
        {!sidebarCollapsed && (
          <div className="leading-tight">
            <div className="text-base font-bold text-gradient">Quosmos</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Quantum, Visualized</div>
          </div>
        )}
      </div>

      {!sidebarCollapsed && (
        <button
          onClick={() => setCommandPalette(true)}
          className="mx-3 mb-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 hover:bg-white/5"
        >
          <span>Search & commands…</span>
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>
      )}

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-4">
        {GROUPS.map((group) => (
          <div key={group.id} className="mb-3">
            {!sidebarCollapsed && <div className="px-2 py-1 label">{group.label}</div>}
            {MODULES.filter((m) => m.group === group.id).map((m) => (
              <button
                key={m.id}
                onClick={() => setModule(m.id)}
                title={m.name}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-all',
                  activeModule === m.id
                    ? 'bg-nebula-500/20 text-white shadow-[inset_0_0_0_1px_rgba(124,138,255,0.4)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                )}
              >
                <span className="text-lg leading-none">{m.icon}</span>
                {!sidebarCollapsed && <span className="truncate">{m.short}</span>}
                {!sidebarCollapsed && activeModule === m.id && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-quantum-cyan animate-pulse-glow" />
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        className="border-t border-white/10 px-4 py-3 text-left text-xs text-slate-500 hover:text-slate-300"
      >
        {sidebarCollapsed ? '»' : '« Collapse'}
      </button>
    </aside>
  );
}

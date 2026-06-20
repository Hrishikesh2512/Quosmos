import { useEffect, useMemo, useRef, useState } from 'react';
import { MODULES, useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/cn';

interface Command {
  id: string;
  title: string;
  hint: string;
  run: () => void;
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPalette, setModule, toggleTutor } = useAppStore();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(
    () => [
      ...MODULES.map((m) => ({
        id: `goto-${m.id}`,
        title: `Open ${m.name}`,
        hint: m.description,
        run: () => setModule(m.id),
      })),
      { id: 'toggle-tutor', title: 'Toggle Quantum Tutor', hint: 'Show contextual explanations', run: toggleTutor },
    ],
    [setModule, toggleTutor],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => (c.title + c.hint).toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPalette(!commandPaletteOpen);
      }
      if (e.key === 'Escape') setCommandPalette(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPalette]);

  if (!commandPaletteOpen) return null;

  const choose = (cmd: Command) => {
    cmd.run();
    setCommandPalette(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[12vh] backdrop-blur-sm"
      onClick={() => setCommandPalette(false)}
    >
      <div
        className="glass-strong w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCursor(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setCursor((c) => Math.min(filtered.length - 1, c + 1));
            if (e.key === 'ArrowUp') setCursor((c) => Math.max(0, c - 1));
            if (e.key === 'Enter' && filtered[cursor]) choose(filtered[cursor]);
          }}
          placeholder="Type a command or search modules…"
          className="w-full border-b border-white/10 bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500"
        />
        <ul className="scrollbar-thin max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-sm text-slate-500">No matching commands.</li>
          )}
          {filtered.map((c, i) => (
            <li key={c.id}>
              <button
                onMouseEnter={() => setCursor(i)}
                onClick={() => choose(c)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-2.5 text-left',
                  i === cursor ? 'bg-nebula-500/20' : 'hover:bg-white/5',
                )}
              >
                <span className="text-sm text-white">{c.title}</span>
                <span className="ml-3 truncate text-xs text-slate-500">{c.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

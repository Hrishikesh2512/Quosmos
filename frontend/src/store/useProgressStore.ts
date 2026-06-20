import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressStore {
  completed: Record<string, number>; // challengeId -> completion timestamp
  hintsUsed: Record<string, number>;
  complete: (id: string) => void;
  recordHint: (id: string) => void;
  reset: (id: string) => void;
  isComplete: (id: string) => boolean;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      completed: {},
      hintsUsed: {},
      complete: (id) =>
        set((s) => (s.completed[id] ? s : { completed: { ...s.completed, [id]: Date.now() } })),
      recordHint: (id) => set((s) => ({ hintsUsed: { ...s.hintsUsed, [id]: (s.hintsUsed[id] ?? 0) + 1 } })),
      reset: (id) =>
        set((s) => {
          const completed = { ...s.completed };
          const hintsUsed = { ...s.hintsUsed };
          delete completed[id];
          delete hintsUsed[id];
          return { completed, hintsUsed };
        }),
      isComplete: (id) => Boolean(get().completed[id]),
    }),
    { name: 'quosmos-progress' },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ModuleId =
  | 'bloch'
  | 'sandbox'
  | 'circuit'
  | 'entanglement'
  | 'superdense'
  | 'teleportation'
  | 'double-slit'
  | 'algorithms'
  | 'tutor'
  | 'challenges';

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  short: string;
  icon: string;
  group: 'foundations' | 'protocols' | 'algorithms' | 'learn';
  description: string;
}

export const MODULES: ModuleMeta[] = [
  { id: 'bloch', name: 'Bloch Sphere Explorer', short: 'Bloch', icon: '🪐', group: 'foundations', description: 'Rotate a 3D single-qubit state and apply gates.' },
  { id: 'sandbox', name: 'Qubit Sandbox', short: 'Sandbox', icon: '🎛️', group: 'foundations', description: 'Sculpt arbitrary qubit states by θ and φ.' },
  { id: 'circuit', name: 'Circuit Builder', short: 'Circuit', icon: '🧩', group: 'foundations', description: 'Drag-and-drop multi-qubit circuits with live results.' },
  { id: 'entanglement', name: 'Entanglement Lab', short: 'Entangle', icon: '🔗', group: 'protocols', description: 'Bell states, EPR pairs and correlation statistics.' },
  { id: 'superdense', name: 'Superdense Coding', short: 'Superdense', icon: '📡', group: 'protocols', description: 'Send two classical bits with a single qubit.' },
  { id: 'teleportation', name: 'Quantum Teleportation', short: 'Teleport', icon: '✨', group: 'protocols', description: 'Move a quantum state using entanglement + 2 bits.' },
  { id: 'double-slit', name: 'Double-Slit Laboratory', short: 'Double-Slit', icon: '🌊', group: 'foundations', description: 'Wave/particle duality and measurement collapse.' },
  { id: 'algorithms', name: 'Algorithms Gallery', short: 'Algorithms', icon: '🧠', group: 'algorithms', description: 'Deutsch–Jozsa, Grover, QFT and Shor.' },
  { id: 'tutor', name: 'Quantum Tutor', short: 'Tutor', icon: '🎓', group: 'learn', description: 'Contextual explanations for the active module.' },
  { id: 'challenges', name: 'Quantum Challenges', short: 'Challenges', icon: '🏆', group: 'learn', description: 'Gamified exercises with hints and validation.' },
];

interface AppState {
  activeModule: ModuleId;
  openTabs: ModuleId[];
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  searchOpen: boolean;
  tutorOpen: boolean;
  backendOnline: boolean;
  setModule: (id: ModuleId) => void;
  openTab: (id: ModuleId) => void;
  closeTab: (id: ModuleId) => void;
  toggleSidebar: () => void;
  setCommandPalette: (open: boolean) => void;
  setSearch: (open: boolean) => void;
  toggleTutor: () => void;
  setBackendOnline: (online: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeModule: 'bloch',
      openTabs: ['bloch'],
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      searchOpen: false,
      tutorOpen: false,
      backendOnline: false,
      setModule: (id) => {
        const { openTabs } = get();
        set({
          activeModule: id,
          openTabs: openTabs.includes(id) ? openTabs : [...openTabs, id],
        });
      },
      openTab: (id) =>
        set((s) => ({
          activeModule: id,
          openTabs: s.openTabs.includes(id) ? s.openTabs : [...s.openTabs, id],
        })),
      closeTab: (id) =>
        set((s) => {
          const openTabs = s.openTabs.filter((t) => t !== id);
          const activeModule =
            s.activeModule === id ? openTabs[openTabs.length - 1] ?? 'bloch' : s.activeModule;
          return { openTabs: openTabs.length ? openTabs : ['bloch'], activeModule };
        }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandPalette: (open) => set({ commandPaletteOpen: open }),
      setSearch: (open) => set({ searchOpen: open }),
      toggleTutor: () => set((s) => ({ tutorOpen: !s.tutorOpen })),
      setBackendOnline: (online) => set({ backendOnline: online }),
    }),
    {
      name: 'quosmos-app',
      partialize: (s) => ({
        activeModule: s.activeModule,
        openTabs: s.openTabs,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
    },
  ),
);

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useCircuitStore } from '@/store/useCircuitStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { TutorPanel } from '@/components/layout/TutorPanel';
import { api } from '@/lib/api';

import { BlochSphereModule } from '@/modules/BlochSphere/BlochSphereModule';
import { QubitSandboxModule } from '@/modules/QubitSandbox/QubitSandboxModule';
import { CircuitBuilderModule } from '@/modules/CircuitBuilder/CircuitBuilderModule';
import { EntanglementModule } from '@/modules/Entanglement/EntanglementModule';
import { SuperdenseModule } from '@/modules/Superdense/SuperdenseModule';
import { TeleportationModule } from '@/modules/Teleportation/TeleportationModule';
import { DoubleSlitModule } from '@/modules/DoubleSlit/DoubleSlitModule';
import { AlgorithmsModule } from '@/modules/Algorithms/AlgorithmsModule';
import { TutorModule } from '@/modules/Tutor/TutorModule';
import { ChallengesModule } from '@/modules/Challenges/ChallengesModule';

const REGISTRY = {
  bloch: BlochSphereModule,
  sandbox: QubitSandboxModule,
  circuit: CircuitBuilderModule,
  entanglement: EntanglementModule,
  superdense: SuperdenseModule,
  teleportation: TeleportationModule,
  'double-slit': DoubleSlitModule,
  algorithms: AlgorithmsModule,
  tutor: TutorModule,
  challenges: ChallengesModule,
} as const;

export default function App() {
  const { activeModule, setBackendOnline } = useAppStore();
  const { undo, redo } = useCircuitStore();

  // Probe the backend once on mount.
  useEffect(() => {
    api.health().then(setBackendOnline);
  }, [setBackendOnline]);

  // Global undo/redo shortcuts.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const ActiveModule = REGISTRY[activeModule];

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="scrollbar-thin flex-1 overflow-auto p-4">
          <ActiveModule />
        </main>
      </div>
      <TutorPanel />
      <CommandPalette />
    </div>
  );
}

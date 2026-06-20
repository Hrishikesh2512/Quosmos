import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../useProjectStore';
import { useProgressStore } from '../useProgressStore';
import { bellState } from '@/quantum/algorithms';

describe('useProjectStore', () => {
  beforeEach(() => useProjectStore.setState({ projects: [] }));

  it('saves, updates and deletes projects', () => {
    const { saveProject } = useProjectStore.getState();
    const p = saveProject({ name: 'Bell', module: 'circuit', circuit: bellState(), notes: '' });
    expect(useProjectStore.getState().projects).toHaveLength(1);

    const updated = saveProject({ id: p.id, name: 'Bell v2', module: 'circuit', circuit: bellState(), notes: 'hi' });
    expect(updated.id).toBe(p.id);
    expect(useProjectStore.getState().projects).toHaveLength(1);
    expect(useProjectStore.getState().getProject(p.id)?.name).toBe('Bell v2');

    useProjectStore.getState().renameProject(p.id, 'Renamed');
    expect(useProjectStore.getState().getProject(p.id)?.name).toBe('Renamed');

    useProjectStore.getState().deleteProject(p.id);
    expect(useProjectStore.getState().projects).toHaveLength(0);
  });
});

describe('useProgressStore', () => {
  beforeEach(() => useProgressStore.setState({ completed: {}, hintsUsed: {} }));

  it('tracks completion, hints and reset', () => {
    const s = useProgressStore.getState();
    expect(s.isComplete('bell')).toBe(false);
    s.complete('bell');
    expect(useProgressStore.getState().isComplete('bell')).toBe(true);
    s.recordHint('bell');
    s.recordHint('bell');
    expect(useProgressStore.getState().hintsUsed['bell']).toBe(2);
    s.reset('bell');
    expect(useProgressStore.getState().isComplete('bell')).toBe(false);
  });
});

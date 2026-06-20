import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../useAppStore';

describe('useAppStore', () => {
  beforeEach(() =>
    useAppStore.setState({ activeModule: 'bloch', openTabs: ['bloch'], tutorOpen: false, commandPaletteOpen: false }),
  );

  it('opens a module as a tab and makes it active', () => {
    useAppStore.getState().setModule('circuit');
    const s = useAppStore.getState();
    expect(s.activeModule).toBe('circuit');
    expect(s.openTabs).toContain('circuit');
  });

  it('does not duplicate tabs', () => {
    useAppStore.getState().openTab('bloch');
    expect(useAppStore.getState().openTabs.filter((t) => t === 'bloch')).toHaveLength(1);
  });

  it('closing the active tab falls back to another', () => {
    useAppStore.getState().setModule('circuit');
    useAppStore.getState().closeTab('circuit');
    expect(useAppStore.getState().activeModule).toBe('bloch');
  });

  it('always keeps at least one tab', () => {
    useAppStore.getState().closeTab('bloch');
    expect(useAppStore.getState().openTabs.length).toBeGreaterThanOrEqual(1);
  });

  it('toggles tutor and command palette', () => {
    useAppStore.getState().toggleTutor();
    expect(useAppStore.getState().tutorOpen).toBe(true);
    useAppStore.getState().setCommandPalette(true);
    expect(useAppStore.getState().commandPaletteOpen).toBe(true);
  });
});

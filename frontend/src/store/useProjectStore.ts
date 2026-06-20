import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Circuit } from '@/quantum/circuit';
import { ModuleId } from './useAppStore';

export interface Project {
  id: string;
  name: string;
  module: ModuleId;
  circuit: Circuit | null;
  createdAt: number;
  updatedAt: number;
  notes: string;
}

interface ProjectStore {
  projects: Project[];
  saveProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Project;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  getProject: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      saveProject: (input) => {
        const now = Date.now();
        const existing = input.id ? get().projects.find((p) => p.id === input.id) : undefined;
        const project: Project = {
          id: input.id ?? `proj_${now.toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
          name: input.name,
          module: input.module,
          circuit: input.circuit,
          notes: input.notes,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
        set((s) => ({
          projects: existing
            ? s.projects.map((p) => (p.id === project.id ? project : p))
            : [project, ...s.projects],
        }));
        return project;
      },
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      renameProject: (id, name) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, name, updatedAt: Date.now() } : p,
          ),
        })),
      getProject: (id) => get().projects.find((p) => p.id === id),
    }),
    { name: 'quosmos-projects' },
  ),
);

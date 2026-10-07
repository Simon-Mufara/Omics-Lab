import { create } from 'zustand';
import type { FacilityProgress, NotebookEntry, PpeItem, RoomId, SampleState } from '../domain/types';

type FacilityStore = FacilityProgress & {
  setRoom: (roomId: RoomId) => void;
  togglePpe: (item: PpeItem) => void;
  updateSample: (change: Partial<SampleState>) => void;
  addNotebookEntry: (entry: Omit<NotebookEntry, 'id' | 'timestamp'>) => void;
  addScore: (points: number) => void;
};

export const useFacilityStore = create<FacilityStore>((set) => ({
  roomId: 'reception',
  ppe: [],
  completedObjectives: [],
  sample: {
    id: 'OMX-2026-001',
    type: 'whole-blood',
    volumeMl: 6,
    temperatureC: 22,
    location: 'reception',
    custody: ['Reception intake'],
    status: 'received',
  },
  notebook: [],
  score: 0,
  setRoom: (roomId) => set({ roomId }),
  togglePpe: (item) =>
    set((state) => ({
      ppe: state.ppe.includes(item) ? state.ppe.filter((value) => value !== item) : [...state.ppe, item],
    })),
  updateSample: (change) =>
    set((state) => ({
      sample: {
        ...state.sample,
        ...change,
        custody: change.location
          ? [...state.sample.custody, `Moved to ${change.location}`]
          : state.sample.custody,
      },
    })),
  addNotebookEntry: (entry) =>
    set((state) => ({
      notebook: [
        ...state.notebook,
        { ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() },
      ].slice(-50),
    })),
  addScore: (points) => set((state) => ({ score: Math.max(0, state.score + points) })),
}));

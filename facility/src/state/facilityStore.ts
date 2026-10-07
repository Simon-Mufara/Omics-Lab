import { create } from 'zustand';
import type { FacilityProgress, PpeItem, RoomId } from '../domain/types';

type FacilityStore = FacilityProgress & {
  setRoom: (roomId: RoomId) => void;
  togglePpe: (item: PpeItem) => void;
};

export const useFacilityStore = create<FacilityStore>((set) => ({
  roomId: 'reception',
  ppe: [],
  completedObjectives: [],
  setRoom: (roomId) => set({ roomId }),
  togglePpe: (item) =>
    set((state) => ({
      ppe: state.ppe.includes(item) ? state.ppe.filter((value) => value !== item) : [...state.ppe, item],
    })),
}));

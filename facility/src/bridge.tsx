import { createRoot, type Root } from 'react-dom/client';
import { FacilityApp } from './ui/FacilityApp';
import { useFacilityStore } from './state/facilityStore';
import type { FacilityProgress } from './domain/types';

const STORAGE_KEY = 'omicslab.facility.progress';

export type FacilityBridge = {
  mount: (container: HTMLElement) => void;
  pause: () => void;
  resume: () => void;
  dispose: () => void;
  saveProgress: () => FacilityProgress;
};

export function createFacilityBridge(): FacilityBridge {
  let root: Root | null = null;
  let paused = false;

  const render = () => {
    if (!root) return;
    root.render(<FacilityApp paused={paused} />);
  };

  return {
    mount(nextContainer) {
      if (root) this.dispose();
      root = createRoot(nextContainer);
      render();
    },
    pause() {
      paused = true;
      render();
    },
    resume() {
      paused = false;
      render();
    },
    dispose() {
      root?.unmount();
      root = null;
    },
    saveProgress() {
      const state = useFacilityStore.getState();
      const progress: FacilityProgress = {
        roomId: state.roomId,
        ppe: state.ppe,
        completedObjectives: state.completedObjectives,
        sample: state.sample,
        notebook: state.notebook,
        score: state.score,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      return progress;
    },
  };
}

export function loadSavedFacilityProgress(): FacilityProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FacilityProgress>;
    if (
      typeof parsed.roomId !== 'string' ||
      !Array.isArray(parsed.ppe) ||
      !Array.isArray(parsed.completedObjectives)
    ) {
      return null;
    }
    return {
      roomId: parsed.roomId as FacilityProgress['roomId'],
      ppe: parsed.ppe as FacilityProgress['ppe'],
      completedObjectives: parsed.completedObjectives.filter(
        (objective): objective is string => typeof objective === 'string',
      ),
      sample: parsed.sample ?? {
        id: 'OMX-2026-001',
        type: 'whole-blood',
        volumeMl: 6,
        temperatureC: 22,
        location: parsed.roomId as FacilityProgress['roomId'],
        custody: ['Restored from saved progress'],
        status: 'received',
      },
      notebook: Array.isArray(parsed.notebook) ? parsed.notebook : [],
      score: typeof parsed.score === 'number' ? parsed.score : 0,
    };
  } catch {
    return null;
  }
}

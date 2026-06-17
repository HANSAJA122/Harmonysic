import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artist: string;
  albumUrl: string;
  duration: number; // in seconds
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isFullScreen: boolean;
  volume: number;
  progress: number;
  queue: Track[];
  
  setCurrentTrack: (track: Track) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlayPause: () => void;
  setFullScreen: (isFullScreen: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  incrementProgress: () => void;
  addToQueue: (track: Track) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  isFullScreen: false,
  volume: 0.8,
  progress: 0,
  queue: [],
  
  setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setFullScreen: (isFullScreen) => set({ isFullScreen }),
  setVolume: (volume) => set({ volume }),
  setProgress: (progress) => set({ progress }),
  incrementProgress: () => set((state) => {
    if (!state.currentTrack) return state;
    if (state.progress >= state.currentTrack.duration) {
      return { isPlaying: false, progress: 0 };
    }
    return { progress: state.progress + 1 };
  }),
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
}));

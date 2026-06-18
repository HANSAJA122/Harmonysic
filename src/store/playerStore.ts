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
  isRightSidebarOpen: boolean;
  volume: number;
  progress: number;
  queue: Track[];
  currentIndex: number;
  isShuffle: boolean;
  isRepeat: boolean;
  likedSongs: Track[];
  savedPlaylists: any[];
  youtubePlayer: any;
  setYoutubePlayer: (player: any) => void;
  setCurrentTrack: (track: Track) => void;
  setCurrentTrackDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlayPause: () => void;
  setFullScreen: (isFullScreen: boolean) => void;
  setRightSidebarOpen: (isOpen: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  addToQueue: (track: Track) => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLikeSong: (track: Track) => void;
  toggleSavePlaylist: (playlist: any) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  isFullScreen: false,
  isRightSidebarOpen: true,
  volume: 0.8,
  progress: 0,
  queue: [],
  currentIndex: -1,
  isShuffle: false,
  isRepeat: false,
  likedSongs: [],
  savedPlaylists: [],
  youtubePlayer: null,
  setYoutubePlayer: (player) => set({ youtubePlayer: player }),
  
  setCurrentTrack: (track) => set({ currentTrack: track, progress: 0, isRightSidebarOpen: true }),
  setCurrentTrackDuration: (duration) => set((state) => ({
    currentTrack: state.currentTrack ? { ...state.currentTrack, duration } : null
  })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setFullScreen: (isFullScreen) => set({ isFullScreen }),
  setRightSidebarOpen: (isOpen) => set({ isRightSidebarOpen: isOpen }),
  setVolume: (volume) => set({ volume }),
  setProgress: (progress) => set({ progress }),
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  
  setQueue: (tracks, startIndex = 0) => {
    if (tracks.length === 0) return;
    set({
      queue: tracks,
      currentIndex: startIndex,
      currentTrack: tracks[startIndex],
      isPlaying: true,
      progress: 0
    });
  },

  playNext: () => set((state) => {
    if (state.queue.length === 0) return state;
    if (state.isRepeat) {
      return { progress: 0, isPlaying: true }; // Just restart if repeating
    }
    
    let nextIndex = state.currentIndex + 1;
    if (state.isShuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else if (nextIndex >= state.queue.length) {
      return { isPlaying: false, progress: 0 }; // End of queue
    }
    
    return {
      currentIndex: nextIndex,
      currentTrack: state.queue[nextIndex],
      isPlaying: true,
      progress: 0
    };
  }),

  playPrevious: () => set((state) => {
    if (state.queue.length === 0 || state.currentIndex <= 0) {
      return { progress: 0 }; // Restart current song if at beginning
    }
    const prevIndex = state.currentIndex - 1;
    return {
      currentIndex: prevIndex,
      currentTrack: state.queue[prevIndex],
      isPlaying: true,
      progress: 0
    };
  }),

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),
  
  toggleLikeSong: (track) => set((state) => {
    const isLiked = state.likedSongs.some(s => s.id === track.id);
    if (isLiked) {
      return { likedSongs: state.likedSongs.filter(s => s.id !== track.id) };
    }
    return { likedSongs: [...state.likedSongs, track] };
  }),
  
  toggleSavePlaylist: (playlist) => set((state) => {
    const isSaved = state.savedPlaylists.some(p => p.id === playlist.id);
    if (isSaved) {
      return { savedPlaylists: state.savedPlaylists.filter(p => p.id !== playlist.id) };
    }
    return { savedPlaylists: [...state.savedPlaylists, playlist] };
  }),
}));

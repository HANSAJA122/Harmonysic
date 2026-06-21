import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  userPlaylists: any[];
  recentlyPlayed: Track[];
  guestPlayCount: number;
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
  toggleLikeSong: (track: Track) => void;
  toggleSavePlaylist: (playlist: any) => void;
  setLikedSongs: (songs: Track[]) => void;
  syncLikedSongsToFirebase: (songs: Track[]) => Promise<void>;
  setRecentlyPlayed: (songs: Track[]) => void;
  syncRecentlyPlayedToFirebase: (songs: Track[]) => Promise<void>;
  setUserPlaylists: (playlists: any[]) => void;
  createPlaylist: (name: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
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
  userPlaylists: [],
  recentlyPlayed: [],
  guestPlayCount: 0,
  youtubePlayer: null,
  setYoutubePlayer: (player) => set({ youtubePlayer: player }),
  
  setCurrentTrack: (track) => set((state) => {
    // Add to recently played (keep last 20)
    const newRecentlyPlayed = [track, ...state.recentlyPlayed.filter(t => t.id !== track.id)].slice(0, 20);
    get().syncRecentlyPlayedToFirebase(newRecentlyPlayed);
    
    return { 
      currentTrack: track, 
      progress: 0, 
      isRightSidebarOpen: true,
      recentlyPlayed: newRecentlyPlayed
    };
  }),
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
    
    const { user, openLoginModal } = useAuthStore.getState();
    const currentPlayCount = get().guestPlayCount;

    if (!user && currentPlayCount >= 3) {
      openLoginModal();
      return; // Block playback
    }

    set({
      queue: tracks,
      currentIndex: startIndex,
      currentTrack: tracks[startIndex],
      isPlaying: true,
      progress: 0,
      guestPlayCount: !user ? currentPlayCount + 1 : currentPlayCount
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
    
    const { user, openLoginModal } = useAuthStore.getState();
    if (!user && state.guestPlayCount >= 3) {
      openLoginModal();
      return { isPlaying: false }; // Pause playback and block
    }

    return {
      currentIndex: nextIndex,
      currentTrack: state.queue[nextIndex],
      isPlaying: true,
      progress: 0,
      guestPlayCount: !user ? state.guestPlayCount + 1 : state.guestPlayCount
    };
  }),

  playPrevious: () => set((state) => {
    if (state.queue.length === 0 || state.currentIndex <= 0) {
      return { progress: 0 }; // Restart current song if at beginning
    }
    
    const { user, openLoginModal } = useAuthStore.getState();
    if (!user && state.guestPlayCount >= 3) {
      openLoginModal();
      return { isPlaying: false }; // Pause playback and block
    }

    const prevIndex = state.currentIndex - 1;
    return {
      currentIndex: prevIndex,
      currentTrack: state.queue[prevIndex],
      isPlaying: true,
      progress: 0,
      guestPlayCount: !user ? state.guestPlayCount + 1 : state.guestPlayCount
    };
  }),

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),
  
  toggleLikeSong: (track) => {
    const { user, openLoginModal } = useAuthStore.getState();
    if (!user) {
      openLoginModal();
      return;
    }

    set((state) => {
      const isLiked = state.likedSongs.some(s => s.id === track.id);
      let newLikedSongs;
      if (isLiked) {
        newLikedSongs = state.likedSongs.filter(s => s.id !== track.id);
      } else {
        newLikedSongs = [...state.likedSongs, track];
      }
      
      // Async sync to firebase
      get().syncLikedSongsToFirebase(newLikedSongs);
      
      return { likedSongs: newLikedSongs };
    });
  },
  
  setLikedSongs: (songs) => set({ likedSongs: songs }),
  
  syncLikedSongsToFirebase: async (songs) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { likedSongs: songs }, { merge: true });
    } catch (error) {
      console.error('Error syncing liked songs:', error);
    }
  },
  
  setRecentlyPlayed: (songs) => set({ recentlyPlayed: songs }),
  
  syncRecentlyPlayedToFirebase: async (songs) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { recentlyPlayed: songs }, { merge: true });
    } catch (error) {
      console.error('Error syncing recently played:', error);
    }
  },
  
  setUserPlaylists: (playlists) => set({ userPlaylists: playlists }),

  createPlaylist: async (name) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    const newPlaylist = {
      id: `playlist_${Date.now()}`,
      title: name,
      tracks: [],
      createdAt: new Date().toISOString()
    };
    
    set((state) => {
      const updatedPlaylists = [...state.userPlaylists, newPlaylist];
      // Sync to firebase
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, { userPlaylists: updatedPlaylists }, { merge: true });
      return { userPlaylists: updatedPlaylists };
    });
  },

  addSongToPlaylist: async (playlistId, track) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    set((state) => {
      const updatedPlaylists = state.userPlaylists.map(p => {
        if (p.id === playlistId) {
          // Avoid duplicates
          if (p.tracks.some((t: any) => t.id === track.id)) return p;
          return { ...p, tracks: [...p.tracks, track] };
        }
        return p;
      });
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, { userPlaylists: updatedPlaylists }, { merge: true });
      return { userPlaylists: updatedPlaylists };
    });
  },

  removeSongFromPlaylist: async (playlistId, trackId) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    set((state) => {
      const updatedPlaylists = state.userPlaylists.map(p => {
        if (p.id === playlistId) {
          return { ...p, tracks: p.tracks.filter((t: any) => t.id !== trackId) };
        }
        return p;
      });
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, { userPlaylists: updatedPlaylists }, { merge: true });
      return { userPlaylists: updatedPlaylists };
    });
  },
  
  toggleSavePlaylist: (playlist) => {
    const { user, openLoginModal } = useAuthStore.getState();
    if (!user) {
      openLoginModal();
      return;
    }

    set((state) => {
      const isSaved = state.savedPlaylists.some(p => p.id === playlist.id);
      if (isSaved) {
        return { savedPlaylists: state.savedPlaylists.filter(p => p.id !== playlist.id) };
      }
      return { savedPlaylists: [...state.savedPlaylists, playlist] };
    });
  },
}),
{
  name: 'harmonysic-storage',
  partialize: (state) => ({ 
    likedSongs: state.likedSongs,
    savedPlaylists: state.savedPlaylists,
    userPlaylists: state.userPlaylists,
    recentlyPlayed: state.recentlyPlayed,
    volume: state.volume,
    isShuffle: state.isShuffle,
    isRepeat: state.isRepeat,
    guestPlayCount: state.guestPlayCount
  }),
}
));

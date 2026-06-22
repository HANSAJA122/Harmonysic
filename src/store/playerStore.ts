import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const getDeviceId = () => {
  if (typeof window !== 'undefined') {
    let id = localStorage.getItem('harmonysic_device_id');
    if (!id) {
      id = 'device_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('harmonysic_device_id', id);
    }
    return id;
  }
  return 'unknown';
};

export interface Track {
  id: string;
  title: string;
  artist: string;
  albumUrl: string;
  duration: number; // in seconds
}

export interface MonthlyStats {
  month: string; // "YYYY-MM"
  totalSeconds: number;
  tracksPlayed: number;
  topArtists: Record<string, number>;
  topTracks: Record<string, { track: Track; count: number }>;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isFullScreen: boolean;
  isLyricsOpen: boolean;
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
  setLyricsOpen: (isOpen: boolean) => void;
  setRightSidebarOpen: (isOpen: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  addToQueue: (track: Track) => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLikeSong: (track: Track) => void;
  toggleSavePlaylist: (playlist: any) => void;
  setSavedPlaylists: (playlists: any[]) => void;
  syncSavedPlaylistsToFirebase: (playlists: any[]) => Promise<void>;
  setLikedSongs: (songs: Track[]) => void;
  syncLikedSongsToFirebase: (songs: Track[]) => Promise<void>;
  setRecentlyPlayed: (songs: Track[]) => void;
  syncRecentlyPlayedToFirebase: (songs: Track[]) => Promise<void>;
  setUserPlaylists: (playlists: any[]) => void;
  createPlaylist: (name: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  updatePlaylistImage: (playlistId: string, imageUrl: string) => Promise<void>;
  reorderUserPlaylistTracks: (playlistId: string, fromIndex: number, toIndex: number) => Promise<void>;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  listeningStats: Record<string, MonthlyStats>;
  recordTrackPlay: (track: Track) => void;
  incrementListeningTime: (seconds: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
  currentTrack: null,
  isPlaying: false,
  isFullScreen: false,
  isLyricsOpen: false,
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
  theme: 'dark',
  listeningStats: {},
  youtubePlayer: null,
  setYoutubePlayer: (player) => set({ youtubePlayer: player }),
  
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  recordTrackPlay: (track) => set((state) => {
    const month = new Date().toISOString().substring(0, 7); // YYYY-MM
    const currentStats = state.listeningStats[month] || {
      month,
      totalSeconds: 0,
      tracksPlayed: 0,
      topArtists: {},
      topTracks: {}
    };

    const newStats = { ...currentStats };
    newStats.tracksPlayed += 1;
    
    if (track.artist) {
      newStats.topArtists[track.artist] = (newStats.topArtists[track.artist] || 0) + 1;
    }
    
    if (track.id) {
      if (!newStats.topTracks[track.id]) {
        newStats.topTracks[track.id] = { track, count: 0 };
      }
      newStats.topTracks[track.id].count += 1;
    }

    // Sync to firebase if user exists
    const user = useAuthStore.getState().user;
    if (user) {
      updateDoc(doc(db, 'users', user.uid), {
        [`listeningStats.${month}`]: newStats
      }).catch(e => console.warn('Failed to sync listening stats', e));
    }

    return {
      listeningStats: {
        ...state.listeningStats,
        [month]: newStats
      }
    };
  }),

  incrementListeningTime: (seconds) => set((state) => {
    const month = new Date().toISOString().substring(0, 7); // YYYY-MM
    const currentStats = state.listeningStats[month] || {
      month,
      totalSeconds: 0,
      tracksPlayed: 0,
      topArtists: {},
      topTracks: {}
    };

    const newStats = { ...currentStats };
    newStats.totalSeconds += seconds;

    // We don't sync this to Firebase every second to avoid quota limits.
    // It gets persisted to localStorage via partialize.
    
    return {
      listeningStats: {
        ...state.listeningStats,
        [month]: newStats
      }
    };
  }),

  setCurrentTrack: (track) => set((state) => {
    // Add to recently played (keep last 20)
    const newRecentlyPlayed = [track, ...state.recentlyPlayed.filter(t => t.id !== track.id)].slice(0, 20);
    get().syncRecentlyPlayedToFirebase(newRecentlyPlayed);
    if (track) {
      get().recordTrackPlay(track);
    }
    
    const user = useAuthStore.getState().user;
    if (user && track) {
      updateDoc(doc(db, 'users', user.uid), {
        currentlyPlaying: {
          trackId: track.id,
          title: track.title,
          artist: track.artist,
          albumUrl: track.albumUrl,
          isPlaying: true,
          updatedAt: new Date().toISOString(),
          deviceId: getDeviceId()
        }
      }).catch(e => console.warn('Failed to sync track state', e));
    } else if (user && !track) {
      updateDoc(doc(db, 'users', user.uid), {
        currentlyPlaying: null
      }).catch(e => console.warn('Failed to clear track state', e));
    }
    
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
  setIsPlaying: (isPlaying) => set((state) => {
    const user = useAuthStore.getState().user;
    if (user && state.currentTrack) {
      updateDoc(doc(db, 'users', user.uid), {
        'currentlyPlaying.isPlaying': isPlaying,
        'currentlyPlaying.updatedAt': new Date().toISOString(),
        'currentlyPlaying.deviceId': getDeviceId()
      }).catch(e => console.warn('Failed to sync play state', e));
    }
    return { isPlaying };
  }),
  togglePlayPause: () => set((state) => {
    const newIsPlaying = !state.isPlaying;
    const user = useAuthStore.getState().user;
    if (user && state.currentTrack) {
      updateDoc(doc(db, 'users', user.uid), {
        'currentlyPlaying.isPlaying': newIsPlaying,
        'currentlyPlaying.updatedAt': new Date().toISOString(),
        'currentlyPlaying.deviceId': getDeviceId()
      }).catch(e => console.warn('Failed to sync play state', e));
    }
    return { isPlaying: newIsPlaying };
  }),
  setFullScreen: (isFullScreen) => set({ isFullScreen }),
  setLyricsOpen: (isOpen) => set({ isLyricsOpen: isOpen }),
  setRightSidebarOpen: (isOpen) => set({ isRightSidebarOpen: isOpen }),
  setVolume: (volume) => set({ volume }),
  setProgress: (progress) => set({ progress }),
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  
  reorderQueue: (fromIndex, toIndex) => set((state) => {
    const newQueue = [...state.queue];
    const [movedItem] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, movedItem);
    
    // Adjust currentIndex if necessary so the currently playing song doesn't change
    let newCurrentIndex = state.currentIndex;
    if (fromIndex === state.currentIndex) {
      newCurrentIndex = toIndex;
    } else if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
      newCurrentIndex--;
    } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
      newCurrentIndex++;
    }
    
    return { queue: newQueue, currentIndex: newCurrentIndex };
  }),
  
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
  
  setSavedPlaylists: (playlists) => set({ savedPlaylists: playlists }),
  
  syncSavedPlaylistsToFirebase: async (playlists) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { savedPlaylists: playlists }, { merge: true });
    } catch (error) {
      console.error('Error syncing saved playlists:', error);
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

  updatePlaylistImage: async (playlistId, imageUrl) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    set((state) => {
      const updatedPlaylists = state.userPlaylists.map(p => 
        p.id === playlistId ? { ...p, imageUrl } : p
      );
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, { userPlaylists: updatedPlaylists }, { merge: true });
      return { userPlaylists: updatedPlaylists };
    });
  },

  reorderUserPlaylistTracks: async (playlistId, fromIndex, toIndex) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    set((state) => {
      const updatedPlaylists = state.userPlaylists.map(p => {
        if (p.id === playlistId) {
          const newTracks = [...p.tracks];
          const [movedItem] = newTracks.splice(fromIndex, 1);
          newTracks.splice(toIndex, 0, movedItem);
          return { ...p, tracks: newTracks };
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
      let newSavedPlaylists;
      if (isSaved) {
        newSavedPlaylists = state.savedPlaylists.filter(p => p.id !== playlist.id);
      } else {
        newSavedPlaylists = [...state.savedPlaylists, playlist];
      }
      
      get().syncSavedPlaylistsToFirebase(newSavedPlaylists);
      
      return { savedPlaylists: newSavedPlaylists };
    });
  },
}),
{
  name: 'harmonysic-storage',
  partialize: (state) => ({ 
    savedPlaylists: state.savedPlaylists,
    volume: state.volume,
    isShuffle: state.isShuffle,
    isRepeat: state.isRepeat,
    guestPlayCount: state.guestPlayCount,
    theme: state.theme,
    listeningStats: state.listeningStats
  }),
}
));

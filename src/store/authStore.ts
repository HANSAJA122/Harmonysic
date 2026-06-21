import { create } from 'zustand';
import { User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { usePlayerStore } from './playerStore';

interface AuthState {
  user: User | null;
  isAuthLoading: boolean;
  isLoginModalOpen: boolean;
  setUser: (user: User | null) => void;
  setAuthLoading: (isLoading: boolean) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  initAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthLoading: true, // Start as true so we don't flash logged-out state
  isLoginModalOpen: false,
  setUser: (user) => set({ user }),
  setAuthLoading: (isLoading) => set({ isAuthLoading: isLoading }),
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  initAuthListener: () => {
    let unsubscribeSnapshot: (() => void) | null = null;
    
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      set({ user, isAuthLoading: false });
      
      // Cleanup previous listener if exists
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
      
      // Sync from Firestore if user logged in
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          
          // First check if it exists, if not create it
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, { 
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              likedSongs: [],
              recentlyPlayed: [],
              userPlaylists: [],
              createdAt: new Date().toISOString()
            });
          }
          
          // Listen to real-time changes
          unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.likedSongs) {
                usePlayerStore.getState().setLikedSongs(data.likedSongs);
              }
              if (data.recentlyPlayed) {
                usePlayerStore.getState().setRecentlyPlayed(data.recentlyPlayed);
              }
              if (data.userPlaylists) {
                usePlayerStore.getState().setUserPlaylists(data.userPlaylists);
              }
            }
          });
          
        } catch (error) {
          console.error('Error syncing user data:', error);
        }
      } else {
        // If logged out, clear the store arrays
        usePlayerStore.getState().setLikedSongs([]);
        usePlayerStore.getState().setRecentlyPlayed([]);
        usePlayerStore.getState().setUserPlaylists([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  },
}));

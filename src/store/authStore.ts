import { create } from 'zustand';
import { User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { usePlayerStore } from './playerStore';

interface AuthState {
  user: User | null;
  isAuthLoading: boolean;
  isLoginModalOpen: boolean;
  setUser: (user: User | null) => void;
  setAuthLoading: (isLoading: boolean) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  initAuthListener: () => void;
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
    return auth.onAuthStateChanged(async (user) => {
      set({ user, isAuthLoading: false });
      
      // Sync from Firestore if user logged in
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.likedSongs) {
              usePlayerStore.getState().setLikedSongs(data.likedSongs);
            }
            if (data.recentlyPlayed) {
              usePlayerStore.getState().setRecentlyPlayed(data.recentlyPlayed);
            }
            if (data.userPlaylists) {
              usePlayerStore.getState().setUserPlaylists(data.userPlaylists);
            }
          } else {
            // Create user document if it doesn't exist
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
        } catch (error) {
          console.error('Error syncing user data:', error);
        }
      }
    });
  },
}));

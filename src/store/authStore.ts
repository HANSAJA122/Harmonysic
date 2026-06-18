import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isAuthLoading: boolean;
  isLoginModalOpen: boolean;
  setUser: (user: User | null) => void;
  setAuthLoading: (isLoading: boolean) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthLoading: true, // Start as true so we don't flash logged-out state
  isLoginModalOpen: false,
  setUser: (user) => set({ user }),
  setAuthLoading: (isLoading) => set({ isAuthLoading: isLoading }),
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
}));

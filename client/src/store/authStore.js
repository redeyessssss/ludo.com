import { create } from 'zustand';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => {
    set({ user, token });
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-storage', JSON.stringify({ user, token }));
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    set({ user: null, token: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
    }
  },
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const { user, token } = JSON.parse(stored);
        set({ user, token });
      }
    }
  },
}));

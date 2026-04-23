import { create } from 'zustand';
import { User } from '../types/auth.types';
import { authService } from '../services/auth.service';
import { storageService } from '../services/storage.service';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  setUser: (user) => {
    set({ user });
    storageService.setAsync(STORAGE_KEYS.USER, user);
  },

  setToken: (token) => {
    set({ token });
    storageService.setSecure(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  logout: () => {
    set({ user: null, token: null });
    storageService.removeSecure(STORAGE_KEYS.AUTH_TOKEN);
    storageService.removeAsync(STORAGE_KEYS.USER);
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  hydrate: async () => {
    try {
      const token = await storageService.getSecure(STORAGE_KEYS.AUTH_TOKEN);
      const user = await storageService.getAsync<User>(STORAGE_KEYS.USER);
      set({ token: token || null, user: user || null });

      if (token && !user) {
        try {
          const profile = await authService.getProfile();
          set({ user: profile });
          storageService.setAsync(STORAGE_KEYS.USER, profile);
        } catch (error) {
          console.error('Failed to fetch profile during hydrate:', error);
        }
      }
    } catch (error) {
      console.error('Failed to hydrate auth:', error);
    }
  },
}));

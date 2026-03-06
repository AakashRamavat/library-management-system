import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/client';

export interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  setTokens: (access: string, refresh: string, user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      setTokens: (access, refresh, user) =>
        set({ accessToken: access, refreshToken: refresh, user, error: null }),
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api<{
            user: User;
            accessToken: string;
            refreshToken: string;
          }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          set({
            user: res.data.user,
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
            isLoading: false,
            error: null,
          });
        } catch (e) {
          set({
            error: e instanceof Error ? e.message : 'Login failed',
            isLoading: false,
          });
          throw e;
        }
      },
      signUp: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api<{
            user: User;
            accessToken: string;
            refreshToken: string;
          }>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
          });
          set({
            user: res.data.user,
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
            isLoading: false,
            error: null,
          });
        } catch (e) {
          set({
            error: e instanceof Error ? e.message : 'Sign up failed',
            isLoading: false,
          });
          throw e;
        }
      },
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, error: null }),
      clearError: () => set({ error: null }),
    }),
    { name: 'library-auth' },
  ),
);

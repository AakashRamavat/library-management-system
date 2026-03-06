import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/client';
import { isAccessTokenExpired } from '../utils/jwt';

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
  /** Refresh access token if expired; call once on app load to avoid 401s. */
  ensureValidToken: () => Promise<void>;
  clearError: () => void;
}

const API_BASE = '/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
      ensureValidToken: async () => {
        const { accessToken, refreshToken, setTokens, logout } = get();
        if (!accessToken || !refreshToken) return;
        if (!isAccessTokenExpired(accessToken)) return;
        try {
          const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          const json = (await res.json()) as
            | { status: true; data: { user: User; accessToken: string; refreshToken: string } }
            | { status: false };
          if (json.status && json.data) {
            setTokens(json.data.accessToken, json.data.refreshToken, json.data.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      },
      clearError: () => set({ error: null }),
    }),
    { name: 'library-auth' },
  ),
);

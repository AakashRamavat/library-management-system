import { useAuthStore } from '../stores/authStore';

const API_BASE = '/api';

export interface ApiSuccess<T> {
  code: number;
  data: T;
  status: true;
}
export interface ApiError {
  code: number;
  errorMessage: string;
  error: Record<string, unknown>;
  data: null;
  status: false;
}

interface ApiOptions extends RequestInit {
  token?: string;
  _retried?: boolean;
}

async function request<T>(path: string, options: ApiOptions): Promise<ApiSuccess<T>> {
  const { token, _retried, ...init } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const json = (await res.json()) as ApiSuccess<T> | ApiError;

  if (res.status === 401 && !_retried && path !== '/auth/refresh') {
    const { refreshToken, setTokens, logout } = useAuthStore.getState();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        const refreshJson = (await refreshRes.json()) as ApiSuccess<{
          user: { id: string; email: string; name: string | null };
          accessToken: string;
          refreshToken: string;
        }> | ApiError;
        if (refreshJson.status && refreshJson.data) {
          setTokens(refreshJson.data.accessToken, refreshJson.data.refreshToken, refreshJson.data.user);
          return request<T>(path, { ...options, token: refreshJson.data.accessToken, _retried: true });
        }
      } catch {
        // refresh failed
      }
      logout();
    }
  }

  if (!json.status) {
    const err = json as ApiError;
    throw new Error(err.errorMessage || 'Request failed');
  }
  return json as ApiSuccess<T>;
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<ApiSuccess<T>> {
  const authToken = useAuthStore.getState().accessToken;
  const token = options.token ?? authToken ?? undefined;
  return request<T>(path, { ...options, token });
}

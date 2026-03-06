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

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<ApiSuccess<T>> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const json = (await res.json()) as ApiSuccess<T> | ApiError;

  if (!json.status) {
    const err = json as ApiError;
    throw new Error(err.errorMessage || 'Request failed');
  }
  return json as ApiSuccess<T>;
}

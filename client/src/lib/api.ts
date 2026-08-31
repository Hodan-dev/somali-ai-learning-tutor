const TOKEN_KEY = 'somali_tutor_token';
const USER_KEY = 'somali_tutor_user';

/** Production API host (e.g. Render). Empty in dev — Vite proxy handles /api. */
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function apiUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
}

/** True on Vercel/production when VITE_API_URL was not set at build time. */
export const isHostedWithoutApi = import.meta.env.PROD && !API_BASE;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at?: string;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.json !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(apiUrl(path), {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (isHostedWithoutApi && res.status === 404) {
      throw new Error(
        'API not connected. In Vercel, add VITE_API_URL to your Render backend URL, then redeploy.'
      );
    }
    throw new Error((data as { error?: string }).error || 'Khalad ayaa dhacay');
  }
  return data as T;
}

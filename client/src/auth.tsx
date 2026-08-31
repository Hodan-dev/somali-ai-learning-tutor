import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { api, clearSession, getStoredUser, setSession, type User } from './lib/api';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      async login(email, password) {
        const data = await api<{ token: string; user: User }>('/api/auth/login', {
          method: 'POST',
          json: { email, password },
        });
        setSession(data.token, data.user);
        setUser(data.user);
        return data.user;
      },
      async register(name, email, password) {
        const data = await api<{ token: string; user: User }>('/api/auth/register', {
          method: 'POST',
          json: { name, email, password },
        });
        setSession(data.token, data.user);
        setUser(data.user);
        return data.user;
      },
      async logout() {
        try {
          await api('/api/auth/logout', { method: 'POST' });
        } catch {
          /* ignore */
        }
        clearSession();
        setUser(null);
      },
      updateUser(updated) {
        const token = localStorage.getItem('somali_tutor_token');
        if (token) setSession(token, updated);
        setUser(updated);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

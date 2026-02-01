import React, { createContext, useContext, useMemo, useState } from 'react';
import { decodeJwt } from '../utils/jwt';

type AuthUser = {
  id: string;
  email: string;
  isAdmin: boolean;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  setToken: (token: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function buildUserFromToken(token: string | null): AuthUser | null {
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload?.sub || !payload?.email) return null;
  return {
    id: String(payload.sub),
    email: String(payload.email),
    isAdmin: Boolean(payload.is_admin),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('token'));

  const user = useMemo(() => buildUserFromToken(token), [token]);

  const setToken = (next: string | null) => {
    setTokenState(next);
    if (next) localStorage.setItem('token', next);
    else localStorage.removeItem('token');
  };

  const logout = () => {
    setToken(null);
  };

  const value = useMemo<AuthContextValue>(() => ({ token, user, setToken, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';

export interface AdminSession {
  userId: string;
  email: string;
  role: string;
  accessToken: string;
}

interface AuthContextValue {
  session: AdminSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
  login: async () => {},
  signOut: () => {},
});

const SESSION_KEY = 'admin_web_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        setSession(JSON.parse(stored));
      }
    } catch {}
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await loginUser(email, password);
    const s: AdminSession = {
      userId: res.user.id,
      email: res.user.email,
      role: res.user.role,
      accessToken: res.accessToken,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
    router.replace('/users');
  }

  function signOut() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    router.replace('/');
  }

  return (
    <AuthContext.Provider value={{ session, isLoading, login, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

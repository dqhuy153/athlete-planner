'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import type { User } from '@athlete-planner/contracts';

interface AppState {
  isLoading: boolean;
  user: User | null;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  refreshUser: (accessToken: string) => Promise<void>;
  signOut: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLoading: false,
      user: null,
      setLoading: (loading) => set({ isLoading: loading }),
      setUser: (user) => set({ user }),
      refreshUser: async (accessToken: string) => {
        try {
          const user = await api.getProfile(accessToken);
          set({ user });
        } catch {
          set({ user: null });
        }
      },
      signOut: () => set({ user: null }),
    }),
    {
      name: 'app-store',
      partialize: (s) => ({ user: s.user }),
    },
  ),
);

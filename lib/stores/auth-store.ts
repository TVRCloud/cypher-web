"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

type AuthState = {
  user: AuthUser | null;
  permissions: string[];
  hydrated: boolean;
  setAuth: (payload: { user: AuthUser; permissions: string[] }) => void;
  clearAuth: () => void;
  setHydrated: (value: boolean) => void;
  hasPermission: (permission: string) => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      hydrated: false,
      setAuth: ({ user, permissions }) => set({ user, permissions }),
      clearAuth: () => set({ user: null, permissions: [] }),
      setHydrated: (value) => set({ hydrated: value }),
      hasPermission: (permission) => get().permissions.includes(permission),
    }),
    {
      name: "cypher-auth",
      partialize: (state) => ({ user: state.user, permissions: state.permissions }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

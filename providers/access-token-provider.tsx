"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (t: string | null) => void;
  // Fetch that auto-injects token and refreshes on 401 once
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => Promise<Response>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AccessTokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    if (!res.ok) {
      setAccessToken(null);
      return null;
    }
    const data = (await res.json()) as {
      accessToken: string;
      expiresIn: number;
    };
    setAccessToken(data.accessToken);
    return data.accessToken;
  }, []);

  // Try refresh on mount to bootstrap session
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const authFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const doFetch = async (token?: string | null) => {
        const headers = new Headers(init?.headers || {});
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      };

      let res = await doFetch(accessToken);
      if (res.status === 401) {
        const newToken = await refresh();
        if (newToken) {
          res = await doFetch(newToken);
        }
      }
      return res;
    },
    [accessToken, refresh]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAccessToken(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ accessToken, setAccessToken, authFetch, logout }),
    [accessToken, authFetch, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AccessTokenProvider");
  return ctx;
}

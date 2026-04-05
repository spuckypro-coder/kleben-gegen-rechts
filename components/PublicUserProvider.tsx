"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface PublicUser {
  id: string;
  name: string;
  email: string;
}

interface PublicUserContextType {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string, newsletter: boolean) => Promise<string | null>;
  logout: () => Promise<void>;
}

const PublicUserContext = createContext<PublicUserContextType>({
  user: null,
  loading: true,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
});

export function PublicUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public-auth/me")
      .then((r) => r.json())
      .then((d) => { setUser(d.user); setLoading(false); });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/public-auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error || "Fehler";
    setUser(data.user);
    return null;
  };

  const register = async (name: string, email: string, password: string, newsletter: boolean) => {
    const res = await fetch("/api/public-auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, newsletter }),
    });
    const data = await res.json();
    if (!res.ok) return data.error || "Fehler";
    setUser(data.user.user ?? data.user);
    return null;
  };

  const logout = async () => {
    await fetch("/api/public-auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <PublicUserContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </PublicUserContext.Provider>
  );
}

export const usePublicUser = () => useContext(PublicUserContext);

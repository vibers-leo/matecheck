import { useState, useEffect, useCallback } from "react";
import { apiFetch, removeAuthToken, getAuthToken } from "./api";

interface User {
  id: number;
  email: string;
  name: string | null;
  avatar_url: string | null;
  nest_id: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const userData = await apiFetch<User>("/auth/me");
      setUser(userData);
    } catch (error) {
      console.error("Profile fetch failed:", error);
      await removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await removeAuthToken();
    setUser(null);
  }, []);

  return { user, loading, signOut, refetchProfile: fetchProfile };
}

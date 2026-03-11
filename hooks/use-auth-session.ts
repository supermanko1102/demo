"use client";

import { useAuthStore } from "@/store/auth-store";

export function useAuthSession() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  return {
    hydrated,
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(accessToken && refreshToken),
  };
}


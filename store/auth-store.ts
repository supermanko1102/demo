import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser } from "@/types/api";

interface CredentialsPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  user: AuthUser | null;
  hydrated: boolean;
  setCredentials: (payload: CredentialsPayload) => void;
  updateAccessToken: (accessToken: string, expiresIn: number) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
      user: null,
      hydrated: false,
      setCredentials: ({ accessToken, refreshToken, expiresIn, user }) =>
        set({ accessToken, refreshToken, expiresIn, user }),
      updateAccessToken: (accessToken, expiresIn) => set({ accessToken, expiresIn }),
      logout: () => set({ accessToken: null, refreshToken: null, expiresIn: null, user: null }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "ionex-admin-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresIn: state.expiresIn,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);


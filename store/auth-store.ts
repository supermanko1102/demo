import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser } from "@/types/api";

/**
 * Auth store for the demo/interview frontend.
 *
 * Current tradeoff:
 * - We persist both accessToken and refreshToken in localStorage so the client can
 *   demonstrate login persistence, token refresh, and request retry without a
 *   server-managed session.
 * - This is acceptable for a demo, but it is not the preferred production design.
 *
 * Production-oriented design:
 * - accessToken should usually stay in memory (or other short-lived client state)
 * - refreshToken should be stored in an HttpOnly cookie so frontend JavaScript
 *   cannot read it
 * - refresh should be performed by sending the cookie back to the auth server
 *
 * We also keep a hydrated flag to avoid redirecting before persisted auth state
 * has been restored.
 */
interface CredentialsPayload {
  // Used by frontend API requests to set the Authorization header.
  accessToken: string;
  // Demo-only client-readable refresh token; production should move this to an HttpOnly cookie.
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

interface AuthState {
  // Used by frontend API requests to set the Authorization header.
  accessToken: string | null;
  // Demo-only client-readable refresh token; production should move this to an HttpOnly cookie.
  refreshToken: string | null;
  expiresIn: number | null;
  user: AuthUser | null;
  // Prevent auth redirects until persisted state has been restored from localStorage.
  hydrated: boolean;
  setCredentials: (payload: CredentialsPayload) => void;
  updateAccessToken: (accessToken: string, expiresIn: number) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  // Persist auth state for refresh/reload UX in the demo. This favors simplicity
  // over strict token storage security; production should prefer cookie-based refresh sessions.
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
      // Prevent redirect flicker by marking hydration complete only after persisted auth state is restored.
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

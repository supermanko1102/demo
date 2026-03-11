"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";

interface UseAuthRedirectOptions {
  mode: "require-auth" | "guest-only";
  redirectTo: string;
}

export function useAuthRedirect({ mode, redirectTo }: UseAuthRedirectOptions) {
  const router = useRouter();
  const session = useAuthSession();

  useEffect(() => {
    if (!session.hydrated) {
      return;
    }

    if (mode === "require-auth" && !session.isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (mode === "guest-only" && session.isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [mode, redirectTo, router, session.hydrated, session.isAuthenticated]);

  return session;
}


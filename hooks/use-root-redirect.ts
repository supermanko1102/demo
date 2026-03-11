"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";

/**
 * 專為根路徑 `/` 設計的雙向導向 hook。
 * 已登入 → /users，未登入 → /login。
 * 等待 store hydrate 完成後才執行導向，避免閃爍。
 */
export function useRootRedirect() {
  const router = useRouter();
  const { hydrated, isAuthenticated } = useAuthSession();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(isAuthenticated ? "/users" : "/login");
  }, [hydrated, isAuthenticated, router]);

  return { hydrated };
}

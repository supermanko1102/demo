"use client";

import { toast } from "sonner";
import { appQueryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";

type EndClientSessionReason = "manual" | "expired";

interface EndClientSessionOptions {
  reason: EndClientSessionReason;
  message?: string;
}

let lastExpiredHandledAt = 0;

export async function endClientSession({ reason, message }: EndClientSessionOptions) {
  if (typeof window === "undefined") {
    return;
  }

  if (reason === "expired") {
    const now = Date.now();
    if (now - lastExpiredHandledAt < 1500) {
      return;
    }
    lastExpiredHandledAt = now;
  }

  await appQueryClient.cancelQueries();
  appQueryClient.clear();
  useAuthStore.getState().logout();

  if (reason === "manual") {
    toast.success(message ?? "已登出");
  } else {
    toast.error(message ?? "登入已失效，請重新登入");
  }

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

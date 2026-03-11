"use client";

import { Loader2 } from "lucide-react";
import { useRootRedirect } from "@/hooks/use-root-redirect";

export default function HomePage() {
  const { hydrated } = useRootRedirect();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_42%,#fff7ed_100%)]">
      <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        {hydrated ? "導向中..." : "載入中..."}
      </div>
    </main>
  );
}


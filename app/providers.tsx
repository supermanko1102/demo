"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { appQueryClient } from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={appQueryClient}>
      <TooltipProvider>
        {children}
        <Toaster position="bottom-left" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

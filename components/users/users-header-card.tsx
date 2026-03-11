"use client";

import { LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuthUser } from "@/types/api";

interface UsersHeaderCardProps {
  user: AuthUser | null;
  onLogout: () => void;
}

export function UsersHeaderCard({ user, onLogout }: UsersHeaderCardProps) {
  return (
    <Card className="border-stone-300/70 bg-white/90">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="h-6 w-6 text-cyan-700" />
            User Management
          </CardTitle>
          <CardDescription className="mt-1">
            已登入帳號：{user?.username ?? "Unknown"}（{user?.role ?? "N/A"}）
          </CardDescription>
        </div>
        <Button onClick={onLogout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          登出
        </Button>
      </CardHeader>
    </Card>
  );
}


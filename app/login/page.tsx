import { ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(8,145,178,0.25),transparent_40%),radial-gradient(circle_at_90%_10%,rgba(217,119,6,0.24),transparent_35%),linear-gradient(180deg,#f4f6f8_0%,#eef2f3_100%)]" />

      <Card className="relative z-10 w-full max-w-md border-stone-300/70 bg-white/92 backdrop-blur">
        <CardHeader className="space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200 bg-cyan-100 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-900">
            <ShieldCheck className="h-3.5 w-3.5" />
            IONEX ADMIN ACCESS
          </div>
          <CardTitle className="text-2xl">登入後台管理系統</CardTitle>
          <CardDescription>
            請輸入帳號密碼以繼續。此頁面將會儲存 Access / Refresh Token。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}

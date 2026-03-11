"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { loginApi, getApiErrorMessage } from "@/lib/api/services";
import { useAuthStore } from "@/store/auth-store";

const loginSchema = z.object({
  username: z.string().trim().min(1, "請輸入帳號"),
  password: z.string().min(1, "請輸入密碼"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  useAuthRedirect({ mode: "guest-only", redirectTo: "/users" });

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin",
      password: "password123",
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setCredentials({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        user: data.user,
      });
      router.replace("/users");
    },
    onError: (error) => {
      setError("root.serverError", {
        message: getApiErrorMessage(error, "登入失敗，請稍後再試。"),
      });
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    clearErrors("root.serverError");

    loginMutation.mutate({
      username: values.username,
      password: values.password,
    });
  };

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
          <CardDescription>請輸入帳號密碼以繼續。此頁面將會儲存 Access / Refresh Token。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" htmlFor="username">
                Username
              </label>
              <Input id="username" autoComplete="username" {...register("username")} />
              {errors.username ? (
                <p className="text-xs font-medium text-rose-700">{errors.username.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" htmlFor="password">
                Password
              </label>
              <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
              {errors.password ? (
                <p className="text-xs font-medium text-rose-700">{errors.password.message}</p>
              ) : null}
            </div>

            {errors.root?.serverError?.message ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {errors.root.serverError.message}
              </div>
            ) : null}

            <Button className="w-full gap-2" disabled={loginMutation.isPending} type="submit">
              {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
              {loginMutation.isPending ? "登入中..." : "登入"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

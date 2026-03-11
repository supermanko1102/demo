"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormValues } from "@/components/form/model";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { getApiErrorMessage } from "@/lib/api/errors";
import { loginApi } from "@/lib/api/services";
import { useAuthStore } from "@/store/auth-store";


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
      toast.success("登入成功", {
        description: `歡迎回來，${data.user.username}！`,
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
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
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
        {loginMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LockKeyhole className="h-4 w-4" />
        )}
        {loginMutation.isPending ? "登入中..." : "登入"}
      </Button>
    </form>
  );
}

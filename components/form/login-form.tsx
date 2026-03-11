"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormValues } from "@/components/form/model";

interface LoginFormProps {
  isPending?: boolean;
  onSubmit: (values: LoginFormValues) => void;
  serverError?: string | null;
}

export function LoginForm({ isPending = false, onSubmit, serverError }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

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

      {serverError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {serverError}
        </div>
      ) : null}

      <Button className="w-full gap-2" disabled={isPending} type="submit">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LockKeyhole className="h-4 w-4" />
        )}
        {isPending ? "登入中..." : "登入"}
      </Button>
    </form>
  );
}

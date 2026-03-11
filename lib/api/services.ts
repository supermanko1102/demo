import { AxiosError } from "axios";
import { rawHttp } from "@/lib/api/client";
import { http } from "@/lib/api/http";
import type {
  ApiErrorPayload,
  LoginResponse,
  RefreshResponse,
  UsersQueryParams,
  UsersResponse,
} from "@/types/api";

export async function loginApi(payload: { username: string; password: string }) {
  const response = await rawHttp.post<LoginResponse>("/auth", payload);
  return response.data;
}

export async function refreshTokenApi(refreshToken: string) {
  const response = await rawHttp.post<RefreshResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });
  return response.data;
}

export async function getUsersApi(params: UsersQueryParams) {
  const response = await http.get<UsersResponse>("/api/users", { params });
  return response.data;
}

export function getApiErrorMessage(error: unknown, fallback = "發生未知錯誤") {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiErrorPayload | undefined;
    return payload?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

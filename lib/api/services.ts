import { rawHttp } from "@/lib/api/client";
import { http } from "@/lib/api/http";
import type { LoginResponse, UsersQueryParams, UsersResponse } from "@/types/api";

export async function loginApi(payload: { username: string; password: string }) {
  const response = await rawHttp.post<LoginResponse>("/auth", payload);
  return response.data;
}

export async function getUsersApi(params: UsersQueryParams) {
  const response = await http.get<UsersResponse>("/api/users", { params });
  return response.data;
}


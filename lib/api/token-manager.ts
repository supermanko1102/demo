import { AxiosHeaders, type AxiosRequestHeaders } from "axios";
import { rawHttp } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";
import type { RefreshResponse } from "@/types/api";

let refreshPromise: Promise<string> | null = null;

export function withAuthorizationHeader(headers: AxiosRequestHeaders | undefined, token: string) {
  const normalizedHeaders = AxiosHeaders.from(headers);
  normalizedHeaders.set("Authorization", `Bearer ${token}`);
  return normalizedHeaders;
}

export function getAccessToken() {
  return useAuthStore.getState().accessToken;
}

export function clearAuthSession() {
  useAuthStore.getState().logout();
}

async function requestAccessTokenRefresh() {
  const { refreshToken, logout, updateAccessToken } = useAuthStore.getState();
  if (!refreshToken) {
    logout();
    throw new Error("Missing refresh token");
  }

  const response = await rawHttp.post<RefreshResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });

  updateAccessToken(response.data.access_token, response.data.expires_in);
  return response.data.access_token;
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestAccessTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}


import { AxiosHeaders, type AxiosRequestHeaders } from "axios";
import { getApiErrorMessage } from "@/lib/api/errors";
import { endClientSession } from "@/lib/auth/end-client-session";
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

export function clearAuthSession(message = "登入已失效，請重新登入") {
  void endClientSession({
    reason: "expired",
    message,
  });
}

async function requestAccessTokenRefresh() {
  const { refreshToken, updateAccessToken } = useAuthStore.getState();
  if (!refreshToken) {
    throw new Error("登入已失效，請重新登入");
  }

  const response = await rawHttp.post<RefreshResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });

  updateAccessToken(response.data.access_token, response.data.expires_in);
  return response.data.access_token;
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestAccessTokenRefresh()
      .catch((error) => {
        clearAuthSession(getApiErrorMessage(error, "登入已失效，請重新登入"));
        return Promise.reject(error);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

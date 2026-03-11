import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/lib/api/client";
import {
  getAccessToken,
  refreshAccessToken,
  withAuthorizationHeader,
} from "@/lib/api/token-manager";
import type { ApiErrorPayload } from "@/types/api";

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
    _ignoreAuthToken?: boolean;
  }
}

http.interceptors.request.use((config) => {
  if (config._ignoreAuthToken) {
    return config;
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    return config;
  }

  config.headers = withAuthorizationHeader(config.headers, accessToken);
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errorCode = error.response?.data?.code;

    if (!originalRequest || originalRequest._skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (status === 401 && errorCode === "TOKEN_EXPIRED" && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._skipAuthRefresh = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers = withAuthorizationHeader(originalRequest.headers, newAccessToken);
        return http(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

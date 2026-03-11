import { AxiosError } from "axios";
import type { ApiErrorPayload } from "@/types/api";

/**
 * 從任意 error 物件中提取使用者可讀的錯誤訊息。
 * 優先使用 API 回傳的 payload，其次是 Error.message，最後回退到 fallback。
 */
export function getApiErrorMessage(error: unknown, fallback = "發生未知錯誤"): string {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiErrorPayload | undefined;
    if (payload?.message) {
      return payload.message;
    }

    if (error.code === "ECONNABORTED") {
      return "請求逾時，請稍後再試";
    }

    if (!error.response) {
      return "網路連線失敗，請稍後再試";
    }

    return error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

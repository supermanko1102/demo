import { rawHttp } from "@/lib/api/client";
import { http } from "@/lib/api/http";
import { clearAuthSession, getAccessToken, refreshAccessToken } from "@/lib/api/token-manager";
import type {
  AgentChatRequest,
  AgentChatResponse,
  LoginResponse,
  UsersQueryParams,
  UsersResponse,
} from "@/types/api";

const AGENT_BACKEND_URL = process.env.NEXT_PUBLIC_AGENT_BACKEND_URL ?? "http://localhost:3400";

interface AgentErrorPayload {
  code?: string;
  error?: string;
  message?: string;
}

export async function loginApi(payload: { username: string; password: string }) {
  const response = await rawHttp.post<LoginResponse>("/auth", payload);
  return response.data;
}

export async function getUsersApi(params: UsersQueryParams) {
  const response = await http.get<UsersResponse>("/api/users", { params });
  return response.data;
}

async function requestAgentChat(payload: AgentChatRequest, accessToken?: string | null) {
  const response = await fetch(`${AGENT_BACKEND_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  let data: AgentChatResponse | AgentErrorPayload | null = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { response, data };
}

function getAgentErrorMessage(data: AgentChatResponse | AgentErrorPayload | null) {
  if (data && "error" in data && typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  if (data && "message" in data && typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  return "Agent 回覆失敗";
}

function isTokenExpiredError(response: Response, data: AgentChatResponse | AgentErrorPayload | null) {
  return response.status === 401 && Boolean(data && "code" in data && data.code === "TOKEN_EXPIRED");
}

export async function askAgentApi(payload: AgentChatRequest) {
  let { response, data } = await requestAgentChat(payload, getAccessToken());

  if (isTokenExpiredError(response, data)) {
    try {
      const newAccessToken = await refreshAccessToken();
      ({ response, data } = await requestAgentChat(payload, newAccessToken));
    } catch (error) {
      clearAuthSession();
      throw error;
    }
  }

  if (!response.ok) {
    throw new Error(getAgentErrorMessage(data));
  }

  if (!data || !("reply" in data) || typeof data.reply !== "string") {
    throw new Error("Agent 回傳格式錯誤");
  }

  if (
    "chart" in data &&
    data.chart &&
    (typeof data.chart !== "object" ||
      !("type" in data.chart) ||
      !("labels" in data.chart) ||
      !("values" in data.chart))
  ) {
    throw new Error("Agent 圖表格式錯誤");
  }

  return data;
}

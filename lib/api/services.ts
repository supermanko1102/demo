import { rawHttp } from "@/lib/api/client";
import { http } from "@/lib/api/http";
import type {
  AgentChatRequest,
  AgentChatResponse,
  LoginResponse,
  UsersQueryParams,
  UsersResponse,
} from "@/types/api";

const AGENT_BACKEND_URL = process.env.NEXT_PUBLIC_AGENT_BACKEND_URL ?? "http://localhost:3400";

export async function loginApi(payload: { username: string; password: string }) {
  const response = await rawHttp.post<LoginResponse>("/auth", payload);
  return response.data;
}

export async function getUsersApi(params: UsersQueryParams) {
  const response = await http.get<UsersResponse>("/api/users", { params });
  return response.data;
}

export async function askAgentApi(payload: AgentChatRequest, accessToken?: string | null) {
  const response = await fetch(`${AGENT_BACKEND_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  let data: AgentChatResponse | { error?: string } | null = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data && "error" in data && data.error ? data.error : "Agent 回覆失敗";
    throw new Error(message);
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

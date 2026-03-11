export interface AuthUser {
  username: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

export interface RefreshResponse {
  access_token: string;
  expires_in: number;
}

export interface UsersQueryParams {
  page: number;
  limit: number;
  name?: string;
  email?: string;
  status?: "active" | "inactive";
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: "active" | "inactive";
  created_at: string;
}

export interface UsersPagination {
  total: number;
  current_page: number;
  per_page: number;
  total_pages: number;
}

export interface UsersResponse {
  data: ApiUser[];
  pagination: UsersPagination;
}

export interface ApiErrorPayload {
  code?: string;
  message?: string;
}

export interface AgentChatRequest {
  message: string;
  timezone?: string;
}

export interface AgentChatResponse {
  reply: string;
}

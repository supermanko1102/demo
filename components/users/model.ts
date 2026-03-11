import { z } from "zod";
import type { UsersQueryParams } from "@/types/api";

export const USERS_QUERY_KEY = "users";

export const USERS_PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
};

export const usersFilterSchema = z.object({
  name: z.string().max(100, "Name 最多 100 字元"),
  email: z.string().max(120, "Email 最多 120 字元"),
  status: z.enum(["all", "active", "inactive"]),
});

export type UsersFilterValues = z.infer<typeof usersFilterSchema>;

export const usersFilterDefaultValues: UsersFilterValues = {
  name: "",
  email: "",
  status: "all",
};

export interface UsersAppliedFilters {
  name?: string;
  email?: string;
  status?: "active" | "inactive";
}

export function toAppliedFilters(values: UsersFilterValues): UsersAppliedFilters {
  return {
    name: values.name.trim() || undefined,
    email: values.email.trim() || undefined,
    status: values.status === "all" ? undefined : values.status,
  };
}

export function buildUsersQueryParams(input: {
  page: number;
  limit: number;
  filters: UsersAppliedFilters;
}): UsersQueryParams {
  return {
    page: input.page,
    limit: input.limit,
    ...input.filters,
  };
}

export function buildUsersQueryKey(queryParams: UsersQueryParams) {
  return [USERS_QUERY_KEY, queryParams] as const;
}

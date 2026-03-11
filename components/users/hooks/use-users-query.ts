"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  buildUsersQueryKey,
  buildUsersQueryParams,
  type UsersAppliedFilters,
} from "@/components/users/model";
import { getUsersApi } from "@/lib/api/services";

interface UseUsersQueryOptions {
  page: number;
  limit: number;
  filters: UsersAppliedFilters;
  enabled: boolean;
}

export function useUsersQuery({ page, limit, filters, enabled }: UseUsersQueryOptions) {
  const queryParams = useMemo(
    () =>
      buildUsersQueryParams({
        page,
        limit,
        filters,
      }),
    [page, limit, filters],
  );

  const usersQuery = useQuery({
    queryKey: buildUsersQueryKey(queryParams),
    queryFn: () => getUsersApi(queryParams),
    placeholderData: keepPreviousData,
    enabled,
  });

  const pagination = usersQuery.data?.pagination;
  const totalPages = pagination?.total_pages ?? 1;

  return {
    usersQuery,
    pagination,
    totalPages,
  };
}

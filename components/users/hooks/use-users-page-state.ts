"use client";

import { useState } from "react";
import { useUsersFilters } from "@/components/users/hooks/use-users-filters";
import { USERS_PAGINATION_DEFAULTS, type UsersAppliedFilters } from "@/components/users/model";

/**
 * 封裝 Users 頁面的分頁 + 篩選狀態協調邏輯。
 * 套用或重設篩選時，頁碼會自動歸一。
 */
export function useUsersPageState() {
  const [page, setPage] = useState(USERS_PAGINATION_DEFAULTS.page);
  const [limit, setLimit] = useState(USERS_PAGINATION_DEFAULTS.limit);
  const [filters, setFilters] = useState<UsersAppliedFilters>({});

  const applyState = ({ filters: nextFilters, limit: nextLimit }: { filters: UsersAppliedFilters; limit: number }) => {
    setPage(1);
    setLimit(nextLimit);
    setFilters(nextFilters);
  };

  const { control, setValue, errors, submitFilters, resetFilters } = useUsersFilters({
    onApply: applyState,
    onReset: applyState,
  });

  return {
    // 分頁狀態
    page,
    limit,
    filters,
    setPage,
    // 篩選表單控制
    control,
    setValue,
    errors,
    submitFilters,
    resetFilters,
  };
}

"use client";

import { useState } from "react";
import { useUsersFilters } from "@/components/users/hooks/use-users-filters";
import { USERS_PAGINATION_DEFAULTS, type UsersAppliedFilters } from "@/components/users/model";

/**
 * 封裝 Users 頁面的分頁 + 篩選狀態協調邏輯。
 * limit 固定使用 USERS_PAGINATION_DEFAULTS.limit，不再由 form 控制。
 * 套用或重設篩選時，頁碼會自動歸一。
 */
export function useUsersPageState() {
  const [page, setPage] = useState(USERS_PAGINATION_DEFAULTS.page);
  const [filters, setFilters] = useState<UsersAppliedFilters>({});

  // limit 固定，不走 form 狀態
  const limit = USERS_PAGINATION_DEFAULTS.limit;

  const applyState = ({ filters: nextFilters }: { filters: UsersAppliedFilters }) => {
    setPage(1);
    setFilters(nextFilters);
  };

  const { control, setValue, errors, submitFilters, resetFilters } = useUsersFilters({
    onApply: applyState,
    onReset: applyState,
  });

  return {
    page,
    limit,
    filters,
    setPage,
    control,
    setValue,
    errors,
    submitFilters,
    resetFilters,
  };
}

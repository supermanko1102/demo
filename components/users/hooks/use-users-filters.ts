"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  toAppliedFilters,
  usersFilterDefaultValues,
  usersFilterSchema,
  type UsersAppliedFilters,
  type UsersFilterValues,
} from "@/components/users/model";

interface UseUsersFiltersOptions {
  onApply: (payload: { filters: UsersAppliedFilters; limit: number }) => void;
  onReset: (payload: { filters: UsersAppliedFilters; limit: number }) => void;
}

export function useUsersFilters({ onApply, onReset }: UseUsersFiltersOptions) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UsersFilterValues>({
    resolver: zodResolver(usersFilterSchema),
    defaultValues: usersFilterDefaultValues,
  });

  const submitFilters = handleSubmit((values) => {
    onApply({
      filters: toAppliedFilters(values),
      limit: values.limit,
    });
  });

  const resetFilters = () => {
    reset(usersFilterDefaultValues);
    onReset({
      filters: {},
      limit: usersFilterDefaultValues.limit,
    });
  };

  return {
    control,
    register,
    errors,
    submitFilters,
    resetFilters,
  };
}

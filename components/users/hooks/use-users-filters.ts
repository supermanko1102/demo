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
  onApply: (payload: { filters: UsersAppliedFilters }) => void;
  onReset: (payload: { filters: UsersAppliedFilters }) => void;
}

export function useUsersFilters({ onApply, onReset }: UseUsersFiltersOptions) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UsersFilterValues>({
    resolver: zodResolver(usersFilterSchema),
    defaultValues: usersFilterDefaultValues,
  });

  const submitFilters = handleSubmit((values) => {
    onApply({ filters: toAppliedFilters(values) });
  });

  const resetFilters = () => {
    reset(usersFilterDefaultValues);
    onReset({ filters: {} });
  };

  return {
    control,
    setValue,
    errors,
    submitFilters,
    resetFilters,
  };
}


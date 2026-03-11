"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getUsersApi } from "@/lib/api/services";

interface UseUsersAutocompleteOptions {
  field: "name" | "email";
  value: string;
  minChars?: number;
  debounceMs?: number;
  limit?: number;
}

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useUsersAutocomplete({
  field,
  value,
  minChars = 2,
  debounceMs = 300,
  limit = 8,
}: UseUsersAutocompleteOptions) {
  const debouncedValue = useDebouncedValue(value, debounceMs);
  const keyword = debouncedValue.trim();
  const enabled = keyword.length >= minChars;

  const suggestionsQuery = useQuery({
    queryKey: ["users-autocomplete", field, keyword, limit],
    queryFn: () =>
      getUsersApi({
        page: 1,
        limit,
        [field]: keyword,
      }),
    enabled,
    staleTime: 30_000,
  });

  const suggestions = useMemo(() => {
    const items = suggestionsQuery.data?.data ?? [];
    const values = items.map((item) => item[field]);
    return Array.from(new Set(values));
  }, [field, suggestionsQuery.data]);

  return {
    keyword,
    enabled,
    suggestions,
    isFetching: suggestionsQuery.isFetching,
    isError: suggestionsQuery.isError,
  };
}


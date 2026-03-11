"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUsersFilters } from "@/components/users/hooks/use-users-filters";
import { useUsersQuery } from "@/components/users/hooks/use-users-query";
import { USERS_PAGINATION_DEFAULTS, type UsersAppliedFilters } from "@/components/users/model";
import { UsersFiltersCard } from "@/components/users/users-filters-card";
import { UsersHeaderCard } from "@/components/users/users-header-card";
import { UsersTableCard } from "@/components/users/users-table-card";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useAuthStore } from "@/store/auth-store";

export function UsersPageClient() {
  const router = useRouter();
  const { hydrated, isAuthenticated } = useAuthRedirect({
    mode: "require-auth",
    redirectTo: "/login",
  });
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [page, setPage] = useState(USERS_PAGINATION_DEFAULTS.page);
  const [limit, setLimit] = useState(USERS_PAGINATION_DEFAULTS.limit);
  const [filters, setFilters] = useState<UsersAppliedFilters>({});

  const { usersQuery, pagination, totalPages } = useUsersQuery({
    page,
    limit,
    filters,
    enabled: hydrated && isAuthenticated,
  });

  const { register, errors, submitFilters, resetFilters } = useUsersFilters({
    onApply: ({ filters: nextFilters, limit: nextLimit }) => {
      setPage(1);
      setLimit(nextLimit);
      setFilters(nextFilters);
    },
    onReset: ({ filters: nextFilters, limit: nextLimit }) => {
      setPage(1);
      setLimit(nextLimit);
      setFilters(nextFilters);
    },
  });

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!hydrated || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_42%,#fff7ed_100%)]">
        <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          驗證登入狀態中...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_42%,#fff7ed_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <UsersHeaderCard onLogout={handleLogout} user={user} />
        <UsersFiltersCard errors={errors} onReset={resetFilters} onSubmit={submitFilters} register={register} />
        <UsersTableCard
          onNextPage={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          onPreviousPage={() => setPage((prev) => Math.max(prev - 1, 1))}
          page={page}
          total={pagination?.total ?? 0}
          totalPages={totalPages}
          usersQuery={usersQuery}
        />
      </div>
    </main>
  );
}

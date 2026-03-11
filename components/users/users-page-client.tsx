"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type CSSProperties, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useUsersFilters } from "@/components/users/hooks/use-users-filters";
import { useUsersQuery } from "@/components/users/hooks/use-users-query";
import { USERS_PAGINATION_DEFAULTS, type UsersAppliedFilters } from "@/components/users/model";
import { UsersFiltersCard } from "@/components/users/users-filters-card";
import { UsersOverviewCards } from "@/components/users/users-overview-cards";
import { UsersTableCard } from "@/components/users/users-table-card";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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

  const { control, register, errors, submitFilters, resetFilters } = useUsersFilters({
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

  const pageUsers = usersQuery.data?.data ?? [];
  const activeUsersInPage = pageUsers.filter((item) => item.status === "active").length;
  const inactiveUsersInPage = pageUsers.filter((item) => item.status === "inactive").length;

  if (!hydrated || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          驗證登入狀態中...
        </div>
      </main>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar
        onLogout={handleLogout}
        user={{
          name: user?.username ?? "Admin",
          email: user?.role ? `${user.role}@ionex.local` : "admin@ionex.local",
          avatar: "https://api.dicebear.com/9.x/glass/svg?seed=IonexAdmin",
        }}
        variant="inset"
      />
      <SidebarInset>
        <SiteHeader title="Users" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <UsersOverviewCards
                activeCount={activeUsersInPage}
                currentPage={page}
                inactiveCount={inactiveUsersInPage}
                totalPages={totalPages}
                totalUsers={pagination?.total ?? 0}
              />
              <div className="px-4 lg:px-6">
                <UsersFiltersCard
                  control={control}
                  errors={errors}
                  onReset={resetFilters}
                  onSubmit={submitFilters}
                  register={register}
                />
              </div>
              <div className="px-4 lg:px-6">
                <UsersTableCard
                  onNextPage={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  onPreviousPage={() => setPage((prev) => Math.max(prev - 1, 1))}
                  page={page}
                  total={pagination?.total ?? 0}
                  totalPages={totalPages}
                  usersQuery={usersQuery}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

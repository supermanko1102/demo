"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { type Control, type FieldErrors, type UseFormSetValue } from "react-hook-form";
import { UsersFiltersSheet } from "@/components/users/users-filters-sheet";
import { type UsersFilterValues } from "@/components/users/model";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getInitials } from "@/lib/utils";
import type { ApiUser, UsersResponse } from "@/types/api";

interface UsersTableCardProps {
  usersQuery: UseQueryResult<UsersResponse, Error>;
  page: number;
  totalPages: number;
  total: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  // Filter props
  control: Control<UsersFilterValues>;
  setValue: UseFormSetValue<UsersFilterValues>;
  errors: FieldErrors<UsersFilterValues>;
  onFilterSubmit: () => void;
  onFilterReset: () => void;
  activeFilterCount: number;
}

function formatDate(input: string) {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return input;
  }
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function statusVariant(status: ApiUser["status"]) {
  return status === "active" ? "default" : "destructive";
}

export function UsersTableCard({
  usersQuery,
  page,
  totalPages,
  total,
  onPreviousPage,
  onNextPage,
  control,
  setValue,
  errors,
  onFilterSubmit,
  onFilterReset,
  activeFilterCount,
}: UsersTableCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-lg">使用者列表</CardTitle>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {usersQuery.isFetching ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                更新中
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                即時資料
              </>
            )}
          </div>

          <UsersFiltersSheet
            activeFilterCount={activeFilterCount}
            control={control}
            errors={errors}
            onFilterReset={onFilterReset}
            onFilterSubmit={onFilterSubmit}
            setValue={setValue}
          />
        </div>
      </CardHeader>

      <CardContent>
        {usersQuery.isError ? (
          <div className="mb-4 flex flex-col gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm text-destructive md:flex-row md:items-center md:justify-between">
            <span>{getApiErrorMessage(usersQuery.error, "讀取列表失敗。")}</span>
            <Button
              className="self-start md:self-auto"
              onClick={() => {
                void usersQuery.refetch();
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              重試
            </Button>
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersQuery.isPending ? (
                <TableRow>
                  <TableCell className="py-10 text-center text-muted-foreground" colSpan={5}>
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      載入中...
                    </span>
                  </TableCell>
                </TableRow>
              ) : null}

              {!usersQuery.isPending && usersQuery.data?.data.length === 0 ? (
                <TableRow>
                  <TableCell className="py-10 text-center text-muted-foreground" colSpan={5}>
                    沒有符合條件的使用者
                  </TableCell>
                </TableRow>
              ) : null}

              {usersQuery.data?.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage alt={item.name} src={item.avatar} />
                        <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
                      </Avatar>
                      <span>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatDate(item.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            共 {total} 筆，第 {page} / {totalPages} 頁
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={page <= 1 || usersQuery.isPending}
              onClick={onPreviousPage}
              type="button"
              variant="outline"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              上一頁
            </Button>
            <Button
              disabled={page >= totalPages || usersQuery.isPending}
              onClick={onNextPage}
              type="button"
              variant="outline"
            >
              下一頁
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Filter, Loader2, RefreshCw } from "lucide-react";
import { Controller, type Control, type FieldErrors, type UseFormSetValue } from "react-hook-form";
import { UsersAutocompleteField } from "@/components/users/users-autocomplete-field";
import { type UsersFilterValues } from "@/components/users/model";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
          {/* 資料狀態 */}
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

          {/* Filter 觸發按鈕 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="h-4 min-w-4 px-1 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent className="w-[320px] sm:w-[380px]">
              <SheetHeader>
                <SheetTitle>篩選條件</SheetTitle>
                <SheetDescription>
                  條件變更後自動套用，選取建議項目或按 Enter 觸發搜尋。
                </SheetDescription>
              </SheetHeader>

              <form
                className="mt-6 flex flex-col gap-5 px-4"
                onSubmit={onFilterSubmit}
              >
                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Name</Label>
                  <UsersAutocompleteField
                    control={control}
                    field="name"
                    onApply={onFilterSubmit}
                    placeholder="Search name..."
                    setValue={setValue}
                  />
                  {errors.name?.message ? (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  ) : null}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Email</Label>
                  <UsersAutocompleteField
                    control={control}
                    field="email"
                    onApply={onFilterSubmit}
                    placeholder="Search email..."
                    setValue={setValue}
                  />
                  {errors.email?.message ? (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  ) : null}
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Status</Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          onFilterSubmit();
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* 清除篩選（只在有條件時顯示） */}
                {activeFilterCount > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="self-start text-muted-foreground"
                    onClick={onFilterReset}
                  >
                    清除全部條件
                  </Button>
                )}
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>

      <CardContent>
        {usersQuery.isError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {getApiErrorMessage(usersQuery.error, "讀取列表失敗。")}
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

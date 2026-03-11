"use client";

import { Search } from "lucide-react";
import { Controller, type Control, type FieldErrors, type UseFormSetValue } from "react-hook-form";
import { UsersAutocompleteField } from "@/components/users/users-autocomplete-field";
import { type UsersFilterValues } from "@/components/users/model";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UsersFiltersCardProps {
  control: Control<UsersFilterValues>;
  setValue: UseFormSetValue<UsersFilterValues>;
  errors: FieldErrors<UsersFilterValues>;
  onSubmit: () => void;
  onReset: () => void;
}

export function UsersFiltersCard({
  control,
  setValue,
  errors,
  onSubmit,
  onReset,
}: UsersFiltersCardProps) {
  return (
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle className="text-lg">Filter & Query</CardTitle>
        <CardDescription>每個條件都是獨立查詢區塊，可單獨套用，不必整排一起送出。</CardDescription>
      </CardHeader>
      <CardContent className="overflow-visible">
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={onSubmit}>
          <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Name Query</p>
              <UsersAutocompleteField
                control={control}
                field="name"
                onApply={onSubmit}
                placeholder="Search name"
                setValue={setValue}
              />
            </div>
            <Button className="w-full" onClick={onSubmit} size="sm" type="button" variant="outline">
              套用姓名
            </Button>
            {errors.name?.message ? <p className="text-xs font-medium text-rose-700">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Email Query</p>
              <UsersAutocompleteField
                control={control}
                field="email"
                onApply={onSubmit}
                placeholder="Search email"
                setValue={setValue}
              />
            </div>
            <Button className="w-full" onClick={onSubmit} size="sm" type="button" variant="outline">
              套用 Email
            </Button>
            {errors.email?.message ? <p className="text-xs font-medium text-rose-700">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Status Query</p>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
            <Button className="w-full" onClick={onSubmit} size="sm" type="button" variant="outline">
              套用狀態
            </Button>
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Page Size</p>
              <Controller
                control={control}
                name="limit"
                render={({ field }) => (
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="10 / page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 / page</SelectItem>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="20">20 / page</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <Button className="w-full" onClick={onSubmit} size="sm" type="button" variant="outline">
              更新每頁筆數
            </Button>
            {errors.limit?.message ? <p className="text-xs font-medium text-rose-700">{errors.limit.message}</p> : null}
          </div>

          <div className="flex gap-2 md:col-span-2 xl:col-span-4">
            <Button className="w-full md:w-auto" type="submit">
              <Search className="mr-2 h-4 w-4" />
              套用目前全部條件
            </Button>
            <Button className="w-full md:w-auto" onClick={onReset} type="button" variant="outline">
              重設全部條件
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

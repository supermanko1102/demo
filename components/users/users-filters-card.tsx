"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Search } from "lucide-react";
import { type UsersFilterValues } from "@/components/users/model";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UsersFiltersCardProps {
  control: Control<UsersFilterValues>;
  register: UseFormRegister<UsersFilterValues>;
  errors: FieldErrors<UsersFilterValues>;
  onSubmit: () => void;
  onReset: () => void;
}

export function UsersFiltersCard({ control, register, errors, onSubmit, onReset }: UsersFiltersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filter & Query</CardTitle>
        <CardDescription>支援姓名、Email、狀態篩選，並可切換每頁筆數。</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 md:grid-cols-12" onSubmit={onSubmit}>
          <Input className="md:col-span-3" placeholder="Search name" {...register("name")} />
          <Input className="md:col-span-3" placeholder="Search email" {...register("email")} />
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full md:col-span-2">
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
          <Controller
            control={control}
            name="limit"
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={String(field.value)}
              >
                <SelectTrigger className="w-full md:col-span-2">
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
          <div className="flex gap-2 md:col-span-2">
            <Button className="flex-1" type="submit">
              <Search className="mr-2 h-4 w-4" />
              套用
            </Button>
            <Button className="flex-1" onClick={onReset} type="button" variant="outline">
              重設
            </Button>
          </div>

          {errors.name?.message ? <p className="text-xs font-medium text-rose-700 md:col-span-3">{errors.name.message}</p> : null}
          {errors.email?.message ? (
            <p className="text-xs font-medium text-rose-700 md:col-span-3">{errors.email.message}</p>
          ) : null}
          {errors.limit?.message ? (
            <p className="text-xs font-medium text-rose-700 md:col-span-3">{errors.limit.message}</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

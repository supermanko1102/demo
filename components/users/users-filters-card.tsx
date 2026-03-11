"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Search } from "lucide-react";
import { type UsersFilterValues } from "@/components/users/model";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface UsersFiltersCardProps {
  register: UseFormRegister<UsersFilterValues>;
  errors: FieldErrors<UsersFilterValues>;
  onSubmit: () => void;
  onReset: () => void;
}

export function UsersFiltersCard({ register, errors, onSubmit, onReset }: UsersFiltersCardProps) {
  return (
    <Card className="border-stone-300/70 bg-white/90">
      <CardHeader>
        <CardTitle className="text-lg">篩選與分頁</CardTitle>
        <CardDescription>支援姓名、Email、狀態篩選，並可切換每頁筆數。</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 md:grid-cols-12" onSubmit={onSubmit}>
          <Input className="md:col-span-3" placeholder="Search name" {...register("name")} />
          <Input className="md:col-span-3" placeholder="Search email" {...register("email")} />
          <select
            className="h-10 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm md:col-span-2"
            {...register("status")}
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            className="h-10 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm md:col-span-2"
            {...register("limit", { valueAsNumber: true })}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
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


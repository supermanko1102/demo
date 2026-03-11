"use client";

import { Filter } from "lucide-react";
import { Controller, type Control, type FieldErrors, type UseFormSetValue } from "react-hook-form";
import { UsersAutocompleteField } from "@/components/users/users-autocomplete-field";
import { type UsersFilterValues } from "@/components/users/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface UsersFiltersSheetProps {
  activeFilterCount: number;
  control: Control<UsersFilterValues>;
  errors: FieldErrors<UsersFilterValues>;
  onFilterReset: () => void;
  onFilterSubmit: () => void;
  setValue: UseFormSetValue<UsersFilterValues>;
}

export function UsersFiltersSheet({
  activeFilterCount,
  control,
  errors,
  onFilterReset,
  onFilterSubmit,
  setValue,
}: UsersFiltersSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="gap-1.5" size="sm" variant="outline">
          <Filter className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 ? <Badge className="h-4 min-w-4 px-1 text-[10px]">{activeFilterCount}</Badge> : null}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[320px] sm:w-[380px]">
        <SheetHeader>
          <SheetTitle>篩選條件</SheetTitle>
          <SheetDescription>
            選取建議項目、切換狀態或按 Enter 後會套用條件。
          </SheetDescription>
        </SheetHeader>

        <form className="mt-6 flex flex-col gap-5 px-4" onSubmit={onFilterSubmit}>
          <div className="space-y-1.5">
            <Label className="text-sm">Name</Label>
            <UsersAutocompleteField
              control={control}
              field="name"
              onApply={onFilterSubmit}
              placeholder="Search name..."
              setValue={setValue}
            />
            {errors.name?.message ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Email</Label>
            <UsersAutocompleteField
              control={control}
              field="email"
              onApply={onFilterSubmit}
              placeholder="Search email..."
              setValue={setValue}
            />
            {errors.email?.message ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
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

          {activeFilterCount > 0 ? (
            <Button
              className="self-start text-muted-foreground"
              onClick={onFilterReset}
              size="sm"
              type="button"
              variant="ghost"
            >
              清除全部條件
            </Button>
          ) : null}
        </form>
      </SheetContent>
    </Sheet>
  );
}

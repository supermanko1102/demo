"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  useController,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { useUsersAutocomplete } from "@/components/users/hooks/use-users-autocomplete";
import { type UsersFilterValues } from "@/components/users/model";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface UsersAutocompleteFieldProps {
  control: Control<UsersFilterValues>;
  field: "name" | "email";
  placeholder: string;
  setValue: UseFormSetValue<UsersFilterValues>;
  onApply: () => void;
  className?: string;
}

export function UsersAutocompleteField({
  control,
  field,
  placeholder,
  setValue,
  onApply,
  className,
}: UsersAutocompleteFieldProps) {
  const [open, setOpen] = useState(false);
  const { field: rhfField } = useController({ control, name: field });

  const autocomplete = useUsersAutocomplete({
    field,
    value: rhfField.value ?? "",
  });

  const showSuggestions = open && autocomplete.enabled;

  const applySuggestion = (value: string) => {
    setValue(field, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setOpen(false);
    onApply();
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        placeholder={placeholder}
        {...rhfField}
        onBlur={() => {
          rhfField.onBlur();
          window.setTimeout(() => setOpen(false), 120);
        }}
        onFocus={() => setOpen(true)}
      />

      {showSuggestions ? (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          {autocomplete.isFetching ? (
            <div className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              搜尋中...
            </div>
          ) : null}

          {!autocomplete.isFetching && autocomplete.isError ? (
            <div className="px-2 py-2 text-xs text-destructive">{autocomplete.errorMessage}</div>
          ) : null}

          {!autocomplete.isFetching && !autocomplete.isError && autocomplete.suggestions.length === 0 ? (
            <div className="px-2 py-2 text-xs text-muted-foreground">沒有建議結果</div>
          ) : null}

          {autocomplete.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applySuggestion(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

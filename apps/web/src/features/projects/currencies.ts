import type { SelectOption } from "@/components/ui/select";

// Mirrors PROJECT_CURRENCY in apps/api/src/db/schema/project.schema.ts.
// Keep the two lists in sync by hand: importing the API's runtime code would pull the
// database layer into the browser bundle.
export const CURRENCY_OPTIONS: SelectOption[] = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "IRR", label: "IRR — Iranian Rial" },
];

export const DEFAULT_CURRENCY = "USD";

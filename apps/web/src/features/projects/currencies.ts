import { projectCurrencySchema } from "schema";
import type { SelectOption } from "@/components/ui/select";

// Labels are a display concern and stay here. The list of codes comes from packages/schema,
// and `Record` makes the compiler fail here when a currency is added there without a label.
const CURRENCY_LABELS: Record<
  (typeof projectCurrencySchema.options)[number],
  string
> = {
  USD: "USD — US Dollar",
  EUR: "EUR — Euro",
  IRR: "IRR — Iranian Rial",
};

export const CURRENCY_OPTIONS: SelectOption[] =
  projectCurrencySchema.options.map((value) => ({
    value,
    label: CURRENCY_LABELS[value],
  }));

export const DEFAULT_CURRENCY = "USD";

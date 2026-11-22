import { EMPTY_VALUE } from "../fluid-samples/fields";

/** `1234.5` -> `1,234.5`, with a fixed count of decimals. `null` shows a dash. */
export function formatNumber(value: number | null | undefined, decimals = 1) {
  if (value === null || value === undefined) return EMPTY_VALUE;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

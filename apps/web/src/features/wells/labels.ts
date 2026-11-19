import {
  RIG_TYPES,
  WELL_DESIGNATIONS,
  WELL_STATUSES,
  WELL_TYPES,
} from "schema";
import type { SelectOption } from "@/components/ui/select";

// Labels are a display concern. The value lists come from packages/schema.
const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const toOptions = (values: readonly string[]): SelectOption[] =>
  values.map((value) => ({ value, label: capitalize(value) }));

// A select cannot hold an empty value, so "not set" uses this stand-in.
export const NONE = "none";
const NONE_OPTION: SelectOption = { value: NONE, label: "Not set" };

export const STATUS_OPTIONS = toOptions(WELL_STATUSES);
export const DESIGNATION_OPTIONS = [
  NONE_OPTION,
  ...toOptions(WELL_DESIGNATIONS),
];
export const WELL_TYPE_OPTIONS = [NONE_OPTION, ...toOptions(WELL_TYPES)];
export const RIG_TYPE_OPTIONS = toOptions(RIG_TYPES);

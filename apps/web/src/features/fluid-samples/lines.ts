import type { SheetLine } from "./components/sample-sheet-table";
import { displayValue, type FieldDef } from "./fields";

/**
 * The lines of the sheet for the typed-in fields. The time is not a line: it is under the
 * name of each sample.
 */
export function linesFromDefs<TSample extends object>(
  defs: FieldDef[],
): SheetLine<TSample>[] {
  return defs
    .filter((def) => def.name !== "sample_time")
    .map((def) => ({
      label: def.label,
      unit: def.unit,
      value: (sample) =>
        displayValue((sample as Record<string, unknown>)[def.name]),
    }));
}

/** A line computed by the server: a number with a fixed count of decimals. */
export function computedLine<TSample extends object>(
  label: string,
  unit: string | undefined,
  name: keyof TSample & string,
  decimals: number,
): SheetLine<TSample> {
  return {
    label,
    unit,
    computed: true,
    value: (sample) => displayValue(sample[name], decimals),
  };
}

import type { BitNozzle } from "schema";
import {
  bodyFromValues,
  type FieldDef,
  type FormValues,
  type SampleBody,
  valuesFromRow,
} from "../fluid-samples/fields";

// The drill string, from the surface down to the bit.
export const DRILL_STRING_DEFS: FieldDef[] = [
  { name: "order", label: "Row (1 = top)", kind: "number", omitEmpty: true },
  { name: "tool_type", label: "Tool type", kind: "text" },
  { name: "length_m", label: "Length", unit: "m", kind: "number" },
  { name: "od_in", label: "O.D.", unit: "in", kind: "number" },
  { name: "id_in", label: "I.D.", unit: "in", kind: "number" },
];

export const BIT_DEFS: FieldDef[] = [
  { name: "bit_type", label: "Bit type", kind: "text" },
  { name: "size_in", label: "Bit size", unit: "in", kind: "number" },
  { name: "manufacturer", label: "Manufactured by", kind: "text" },
  {
    name: "nozzles_text",
    label: "Nozzles (size in 32nds x quantity)",
    kind: "text",
  },
];

/** `[{ size_32nds: 12, qty: 3 }]` -> `12x3`. */
export const nozzlesText = (nozzles: BitNozzle[]) =>
  nozzles.map((nozzle) => `${nozzle.size_32nds}x${nozzle.qty}`).join(", ");

/** `12x3, 13x1` -> the nozzles. A part that is not `size x quantity` is sent as empty, so the API says so. */
export function parseNozzles(text: string): BitNozzle[] {
  return text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .map((part) => {
      const match = /^(\d+)\s*[x×]\s*(\d+)$/i.exec(part);
      return {
        size_32nds: match ? Number(match[1]) : Number.NaN,
        qty: match ? Number(match[2]) : Number.NaN,
      };
    });
}

export function bitToBody(defs: FieldDef[], values: FormValues): SampleBody {
  const { nozzles_text: _text, ...rest } = bodyFromValues(defs, values);
  return { ...rest, nozzles: parseNozzles(values.nozzles_text ?? "") };
}

export function bitToValues(
  defs: FieldDef[],
  row: Record<string, unknown>,
): FormValues {
  return {
    ...valuesFromRow(defs, row),
    nozzles_text: nozzlesText((row.nozzles as BitNozzle[] | undefined) ?? []),
  };
}

// The measured values of a fluid sample, described once so that the form, the sheet and the
// request body all agree.
export type FieldDef = {
  name: string;
  label: string;
  unit?: string;
  // An empty field is left out of the body (the API then fills it, or keeps the old value)
  // instead of being sent as `null`.
  omitEmpty?: boolean;
} & (
  | { kind: "number" }
  | { kind: "text" }
  | { kind: "time" }
  | { kind: "select"; options: readonly string[] }
);

/** Text values of the form: numbers are kept as text while typing. */
export type FormValues = Record<string, string>;

/** What the web sends: numbers, text and choices, with `null` for "not measured". */
export type SampleBody = Record<string, unknown>;

export function emptyValues(defs: FieldDef[]): FormValues {
  return Object.fromEntries(
    defs.map((def) => [
      def.name,
      def.kind === "select" ? (def.options[0] ?? "") : "",
    ]),
  );
}

/** The form values of a stored sample. */
export function valuesFromRow(
  defs: FieldDef[],
  row: Record<string, unknown>,
): FormValues {
  return Object.fromEntries(
    defs.map((def) => {
      const value = row[def.name];
      return [
        def.name,
        value === null || value === undefined ? "" : String(value),
      ];
    }),
  );
}

/**
 * The request body of a form. An empty field becomes `null` ("not measured"), except a choice,
 * which always has a value.
 */
export function bodyFromValues(
  defs: FieldDef[],
  values: FormValues,
): SampleBody {
  return Object.fromEntries(
    defs.map((def) => {
      const text = (values[def.name] ?? "").trim();
      if (def.kind === "number")
        return [def.name, text === "" ? null : Number(text)];
      if (def.kind === "time") return [def.name, text === "" ? null : text];
      return [def.name, text];
    }),
  );
}

export const EMPTY_VALUE = "—";

/** A stored value as the sheet shows it. */
export function displayValue(value: unknown, decimals?: number): string {
  if (value === null || value === undefined || value === "") return EMPTY_VALUE;
  if (typeof value === "number" && decimals !== undefined) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return String(value);
}

/**
 * The form builds a body by field name, so its type is loose. The API checks every field, and
 * this is the one place where the body is given the type Eden expects.
 */
export const typedBody = <TBody>(body: SampleBody) => body as unknown as TBody;

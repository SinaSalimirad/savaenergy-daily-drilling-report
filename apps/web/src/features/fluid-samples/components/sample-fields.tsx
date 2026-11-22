"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import type { FieldDef, FormValues } from "../fields";

function FieldControl({
  def,
  id,
  value,
  invalid,
  onChange,
}: {
  def: FieldDef;
  id: string;
  value: string;
  invalid: boolean;
  onChange: (value: string) => void;
}) {
  if (def.kind === "select") {
    // A native select keeps this form simple: the list is short and fixed.
    return (
      <select
        id={id}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {def.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
  const isNumber = def.kind === "number";
  return (
    <Input
      id={id}
      type={isNumber ? "number" : "time"}
      min={isNumber ? 0 : undefined}
      step={isNumber ? "any" : undefined}
      inputMode={isNumber ? "decimal" : undefined}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={invalid}
    />
  );
}

/** The inputs of a sample's form, two per row. */
export function SampleFields({
  defs,
  values,
  onChange,
  fieldErrors,
}: {
  defs: FieldDef[];
  values: FormValues;
  onChange: (values: FormValues) => void;
  fieldErrors: Record<string, string | undefined>;
}) {
  const id = useId();

  return (
    <div className="grid max-h-[60vh] gap-4 overflow-y-auto px-4 sm:grid-cols-2">
      {defs.map((def) => (
        <div key={def.name} className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-${def.name}`} className="font-medium text-sm">
            {def.label}
            {def.unit && (
              <span className="font-normal text-muted-foreground">
                {" "}
                ({def.unit})
              </span>
            )}
          </label>
          <FieldControl
            def={def}
            id={`${id}-${def.name}`}
            value={values[def.name] ?? ""}
            invalid={Boolean(fieldErrors[def.name])}
            onChange={(value) => onChange({ ...values, [def.name]: value })}
          />
          {fieldErrors[def.name] && (
            <p className="text-destructive text-sm">{fieldErrors[def.name]}</p>
          )}
        </div>
      ))}
    </div>
  );
}

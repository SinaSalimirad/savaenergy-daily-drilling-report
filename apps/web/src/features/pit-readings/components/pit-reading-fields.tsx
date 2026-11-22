"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";

// Numbers are kept as text while typing and converted when the form is sent.
export type PitReadingFormValues = {
  volume: string;
  mud_weight: string;
  mud_type: string;
};

export const EMPTY_FORM_VALUES: PitReadingFormValues = {
  volume: "",
  mud_weight: "",
  mud_type: "",
};

/** The fields of a reading that the web sends: an empty optional field becomes `null`. */
export function toBody(values: PitReadingFormValues) {
  return {
    // An empty volume becomes NaN, which JSON sends as null: the API answers with its message.
    volume: values.volume === "" ? Number.NaN : Number(values.volume),
    mud_weight: values.mud_weight === "" ? null : Number(values.mud_weight),
    mud_type: values.mud_type.trim() === "" ? null : values.mud_type.trim(),
  };
}

export function PitReadingFields({
  values,
  onChange,
  fieldErrors,
}: {
  values: PitReadingFormValues;
  onChange: (values: PitReadingFormValues) => void;
  fieldErrors: Record<string, string | undefined>;
}) {
  const id = useId();

  const field = (
    name: keyof PitReadingFormValues,
    label: string,
    props: { type: string; placeholder?: string },
  ) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`${id}-${name}`} className="font-medium text-sm">
        {label}
      </label>
      <Input
        id={`${id}-${name}`}
        type={props.type}
        min={props.type === "number" ? 0 : undefined}
        step={props.type === "number" ? "any" : undefined}
        inputMode={props.type === "number" ? "decimal" : undefined}
        placeholder={props.placeholder}
        value={values[name]}
        onChange={(event) =>
          onChange({ ...values, [name]: event.target.value })
        }
        aria-invalid={Boolean(fieldErrors[name])}
      />
      {fieldErrors[name] && (
        <p className="text-destructive text-sm">{fieldErrors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="grid gap-4 px-4 sm:grid-cols-2">
      {field("volume", "Volume (bbl)", { type: "number", placeholder: "250" })}
      {field("mud_weight", "MW (pcf)", { type: "number", placeholder: "130" })}
      <div className="sm:col-span-2">
        {field("mud_type", "Mud type", {
          type: "text",
          placeholder: "Salt Saturate Mud",
        })}
      </div>
    </div>
  );
}

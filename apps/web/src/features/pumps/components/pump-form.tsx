"use client";

import { useForm } from "@tanstack/react-form";
import { type ReactNode, useId } from "react";
import type { PumpType } from "schema";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useProjects } from "@/features/projects/api";
import { useProjectFilter } from "@/features/projects/project-filter";
import { ApiError } from "@/lib/api-error";
import { type Pump, useCreatePump, useUpdatePump } from "../api";
import { PUMP_TYPE_OPTIONS } from "../labels";

// Numbers are kept as text while typing and converted on submit.
const emptyValues = {
  project_id: "",
  // Empty means "next free".
  sort_order: "",
  model: "",
  type: "triplex" as PumpType,
  liner_diameter: "",
  // Only a duplex pump has one.
  rod_diameter: "",
  stroke_length: "",
  efficiency: "",
};

function valuesFrom(pump: Pump): typeof emptyValues {
  return {
    project_id: pump.project_id,
    sort_order: String(pump.sort_order),
    model: pump.model,
    type: pump.type,
    liner_diameter: String(pump.liner_diameter),
    rod_diameter: pump.rod_diameter === null ? "" : String(pump.rod_diameter),
    stroke_length: String(pump.stroke_length),
    efficiency: String(pump.efficiency),
  };
}

// An empty field becomes NaN, which JSON sends as null: the API answers with the field's message.
const toNumber = (text: string) =>
  text.trim() === "" ? Number.NaN : Number(text);

const ORDER_TAKEN_CODE = "PUMP_SORT_ORDER_TAKEN";

type FieldProps = {
  label: string;
  error?: string;
  children: (props: { id: string; invalid: boolean }) => ReactNode;
};

function Field({ label, error, children }: FieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-medium text-sm">
        {label}
      </label>
      {children({ id, invalid: Boolean(error) })}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}

/** What the API said went wrong: a message for the form and messages for single fields. */
function toServerErrors(error: unknown) {
  if (!(error instanceof ApiError)) {
    return { form: "Something went wrong.", fields: {} };
  }
  if (error.code === ORDER_TAKEN_CODE) {
    return { form: undefined, fields: { sort_order: error.message } };
  }
  const hasFieldErrors = Object.keys(error.fieldErrors).length > 0;
  return {
    form: hasFieldErrors ? undefined : error.message,
    fields: error.fieldErrors,
  };
}

// Errors come from the API (see `onSubmitAsync`), so they are plain strings.
const firstError = (errors: unknown[]) =>
  errors.find((error): error is string => typeof error === "string");

type NumberFieldName =
  | "liner_diameter"
  | "rod_diameter"
  | "stroke_length"
  | "efficiency";

const NUMBER_FIELDS: { name: NumberFieldName; label: string; step: string }[] =
  [
    { name: "liner_diameter", label: "Liner diameter (in)", step: "0.001" },
    { name: "rod_diameter", label: "Rod diameter (in)", step: "0.001" },
    { name: "stroke_length", label: "Stroke length (in)", step: "0.001" },
    { name: "efficiency", label: "Efficiency (%)", step: "0.01" },
  ];

/** Creates a pump, or edits `pump` when one is given. */
export function PumpForm({
  pump,
  onSaved,
}: {
  pump?: Pump;
  onSaved: () => void;
}) {
  const createPump = useCreatePump();
  const updatePump = useUpdatePump();
  // The API allows at most 100 per page.
  const projects = useProjects({ page: 1, pageSize: 100, archived: false });
  const projectOptions = (projects.data?.data ?? []).map((project) => ({
    value: project.id,
    label: project.name,
  }));

  // A new pump starts in the project chosen in the header.
  const { projectId: headerProjectId } = useProjectFilter();

  const form = useForm({
    defaultValues: pump
      ? valuesFrom(pump)
      : { ...emptyValues, project_id: headerProjectId ?? "" },
    validators: {
      // Server-side validation: the API is the only place the rules live.
      onSubmitAsync: async ({ value }) => {
        const body = {
          project_id: value.project_id,
          // Left out on create, the API puts the pump last. On edit it is always filled.
          ...(value.sort_order === ""
            ? {}
            : { sort_order: Number(value.sort_order) }),
          model: value.model,
          type: value.type,
          liner_diameter: toNumber(value.liner_diameter),
          // Cleared on a triplex, so changing the type back does not keep a stale rod.
          rod_diameter:
            value.type === "duplex" ? toNumber(value.rod_diameter) : null,
          stroke_length: toNumber(value.stroke_length),
          efficiency: toNumber(value.efficiency),
        };
        try {
          if (pump) {
            await updatePump.mutateAsync({ id: pump.id, body });
          } else {
            await createPump.mutateAsync(body);
          }
        } catch (error) {
          return toServerErrors(error);
        }
        toast.add({
          type: "success",
          title: pump ? "Pump updated" : "Pump created",
        });
        onSaved();
        return undefined;
      },
    },
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto"
    >
      <div className="grid gap-4 px-4 sm:grid-cols-2">
        <form.Field name="project_id">
          {(field) => (
            <div>
              <Field
                label="Project"
                error={firstError(field.state.meta.errors)}
              >
                {({ id, invalid }) => (
                  <Combobox
                    items={projectOptions}
                    value={
                      projectOptions.find(
                        (option) => option.value === field.state.value,
                      ) ?? null
                    }
                    onValueChange={(option) =>
                      field.handleChange(option?.value ?? "")
                    }
                  >
                    <ComboboxInput
                      id={id}
                      className="h-9 w-full rounded-md bg-transparent shadow-xs"
                      placeholder="Search for a project"
                      aria-invalid={invalid}
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>No projects found.</ComboboxEmpty>
                      <ComboboxList>
                        {(option: { value: string; label: string }) => (
                          <ComboboxItem key={option.value} value={option}>
                            {option.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                )}
              </Field>
            </div>
          )}
        </form.Field>

        <form.Field name="sort_order">
          {(field) => (
            <Field label="Row" error={firstError(field.state.meta.errors)}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  placeholder={pump ? undefined : "Leave blank to add it last"}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="model">
          {(field) => (
            <Field label="Model" error={firstError(field.state.meta.errors)}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  placeholder="For example FH 1500"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="type">
          {(field) => (
            <Field label="Type" error={firstError(field.state.meta.errors)}>
              {({ id, invalid }) => (
                <SimpleSelect
                  id={id}
                  invalid={invalid}
                  options={PUMP_TYPE_OPTIONS}
                  placeholder="Select a type"
                  value={field.state.value}
                  onValueChange={(value) =>
                    value && field.handleChange(value as PumpType)
                  }
                />
              )}
            </Field>
          )}
        </form.Field>

        {NUMBER_FIELDS.map(({ name, label, step }) => (
          <form.Subscribe
            key={name}
            selector={(state) => state.values.type === "duplex"}
          >
            {(isDuplex) =>
              (name !== "rod_diameter" || isDuplex) && (
                <form.Field name={name}>
                  {(field) => (
                    <Field
                      label={label}
                      error={firstError(field.state.meta.errors)}
                    >
                      {({ id, invalid }) => (
                        <Input
                          id={id}
                          name={field.name}
                          type="number"
                          min={0}
                          step={step}
                          inputMode="decimal"
                          value={field.state.value}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          onBlur={field.handleBlur}
                          aria-invalid={invalid}
                        />
                      )}
                    </Field>
                  )}
                </form.Field>
              )
            }
          </form.Subscribe>
        ))}

        <form.Subscribe selector={(state) => firstError(state.errors)}>
          {(formError) =>
            formError && (
              <p className="text-destructive text-sm sm:col-span-2">
                {formError}
              </p>
            )
          }
        </form.Subscribe>
      </div>

      <DialogFooter className="flex-row justify-end">
        <DialogClose
          render={<Button variant="outline" type="button" className="h-10" />}
        >
          Cancel
        </DialogClose>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" className="h-10" disabled={isSubmitting}>
              {isSubmitting
                ? pump
                  ? "Saving…"
                  : "Creating…"
                : pump
                  ? "Save changes"
                  : "Create pump"}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}

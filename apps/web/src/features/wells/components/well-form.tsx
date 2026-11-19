"use client";

import { useForm } from "@tanstack/react-form";
import { type ReactNode, useId } from "react";
import type { RigType, WellDesignation, WellStatus, WellType } from "schema";
import { DatePicker } from "@/components/forms/date-picker";
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
import { ApiError } from "@/lib/api-error";
import { useCreateWell, useUpdateWell, type Well } from "../api";
import {
  DESIGNATION_OPTIONS,
  NONE,
  RIG_TYPE_OPTIONS,
  STATUS_OPTIONS,
  WELL_TYPE_OPTIONS,
} from "../labels";

const emptyValues = {
  project_id: "",
  name: "",
  status: "planned" as WellStatus,
  rig_name: "",
  rig_type: "onshore" as RigType,
  designation: NONE as WellDesignation | typeof NONE,
  well_type: NONE as WellType | typeof NONE,
  spud_date: "",
  // Kept as text while typing; converted to a number on submit.
  water_depth: "",
};

function valuesFrom(well: Well): typeof emptyValues {
  return {
    project_id: well.project_id,
    name: well.name,
    // Archived wells cannot be edited (see the actions menu), so this is never "archived".
    status: well.status as WellStatus,
    rig_name: well.rig_name,
    rig_type: well.rig_type,
    designation: well.designation ?? NONE,
    well_type: well.well_type ?? NONE,
    spud_date: well.spud_date ?? "",
    water_depth: well.water_depth === null ? "" : String(well.water_depth),
  };
}

const NAME_TAKEN_CODE = "WELL_NAME_TAKEN";

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
  if (error.code === NAME_TAKEN_CODE) {
    return { form: undefined, fields: { name: error.message } };
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

/** Creates a well, or edits `well` when one is given. */
export function WellForm({
  well,
  onSaved,
}: {
  well?: Well;
  onSaved: () => void;
}) {
  const createWell = useCreateWell();
  const updateWell = useUpdateWell();
  // The API allows at most 100 per page; the select lists the active projects.
  const projects = useProjects({ page: 1, pageSize: 100, archived: false });
  const projectOptions = (projects.data?.data ?? []).map((project) => ({
    value: project.id,
    label: project.name,
  }));

  const form = useForm({
    defaultValues: well ? valuesFrom(well) : emptyValues,
    validators: {
      // Server-side validation: the API is the only place the rules live.
      onSubmitAsync: async ({ value }) => {
        const body = {
          project_id: value.project_id,
          name: value.name,
          status: value.status,
          rig_name: value.rig_name,
          rig_type: value.rig_type,
          designation: value.designation === NONE ? null : value.designation,
          well_type: value.well_type === NONE ? null : value.well_type,
          spud_date: value.spud_date === "" ? null : value.spud_date,
          // Only offshore rigs have a water depth; the API and the database enforce it too.
          water_depth:
            value.rig_type !== "offshore" || value.water_depth === ""
              ? null
              : Number(value.water_depth),
        };
        try {
          if (well) {
            await updateWell.mutateAsync({ id: well.id, body });
          } else {
            await createWell.mutateAsync(body);
          }
        } catch (error) {
          return toServerErrors(error);
        }
        toast.add({
          type: "success",
          title: well ? "Well updated" : "Well created",
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
            <Field label="Project" error={firstError(field.state.meta.errors)}>
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
                    // Same height, radius and shadow as the other inputs.
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
          )}
        </form.Field>

        <form.Field name="name">
          {(field) => (
            <Field
              label="Well name"
              error={firstError(field.state.meta.errors)}
            >
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  placeholder="e.g. SP14-A1"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                  autoFocus
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="status">
          {(field) => (
            <Field label="Status" error={firstError(field.state.meta.errors)}>
              {({ id, invalid }) => (
                <SimpleSelect
                  id={id}
                  invalid={invalid}
                  options={STATUS_OPTIONS}
                  placeholder="Select a status"
                  value={field.state.value}
                  onValueChange={(value) =>
                    value && field.handleChange(value as WellStatus)
                  }
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="rig_name">
          {(field) => (
            <Field label="Rig name" error={firstError(field.state.meta.errors)}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  placeholder="e.g. Saipem 10000"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="rig_type">
          {(field) => (
            <Field label="Rig type" error={firstError(field.state.meta.errors)}>
              {({ id, invalid }) => (
                <SimpleSelect
                  id={id}
                  invalid={invalid}
                  options={RIG_TYPE_OPTIONS}
                  placeholder="Select a rig type"
                  value={field.state.value}
                  onValueChange={(value) => {
                    if (!value) return;
                    field.handleChange(value as RigType);
                    // An onshore rig has no water depth, so drop what was typed.
                    if (value !== "offshore") {
                      form.setFieldValue("water_depth", "");
                    }
                  }}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="designation">
          {(field) => (
            <Field
              label="Designation"
              error={firstError(field.state.meta.errors)}
            >
              {({ id, invalid }) => (
                <SimpleSelect
                  id={id}
                  invalid={invalid}
                  options={DESIGNATION_OPTIONS}
                  placeholder="Select a designation"
                  value={field.state.value}
                  onValueChange={(value) =>
                    value && field.handleChange(value as WellDesignation)
                  }
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="well_type">
          {(field) => (
            <Field
              label="Well type"
              error={firstError(field.state.meta.errors)}
            >
              {({ id, invalid }) => (
                <SimpleSelect
                  id={id}
                  invalid={invalid}
                  options={WELL_TYPE_OPTIONS}
                  placeholder="Select a type"
                  value={field.state.value}
                  onValueChange={(value) =>
                    value && field.handleChange(value as WellType)
                  }
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="spud_date">
          {(field) => (
            <Field
              label="Spud date"
              error={firstError(field.state.meta.errors)}
            >
              {({ id, invalid }) => (
                <DatePicker
                  id={id}
                  invalid={invalid}
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.rig_type}>
          {(rigType) => (
            <form.Field name="water_depth">
              {(field) => (
                <Field
                  label="Water depth"
                  error={firstError(field.state.meta.errors)}
                >
                  {({ id, invalid }) => (
                    <Input
                      disabled={rigType !== "offshore"}
                      id={id}
                      name={field.name}
                      type="number"
                      min={0}
                      step="any"
                      inputMode="decimal"
                      placeholder={
                        rigType === "offshore"
                          ? "e.g. 52.5"
                          : "Offshore rigs only"
                      }
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
          )}
        </form.Subscribe>

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
                ? well
                  ? "Saving…"
                  : "Creating…"
                : well
                  ? "Save changes"
                  : "Create well"}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}

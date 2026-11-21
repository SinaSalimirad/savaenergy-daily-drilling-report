"use client";

import { useForm } from "@tanstack/react-form";
import { type ReactNode, useId } from "react";
import type { SceType } from "schema";
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
import { type Sce, useCreateSce, useUpdateSce } from "../api";
import { SCE_TYPE_OPTIONS } from "../labels";

// Numbers are kept as text while typing and converted on submit.
const emptyValues = {
  project_id: "",
  // Empty means "next free".
  sort_order: "",
  type: "shale_shaker" as SceType,
  // Empty means "next free number of this type".
  unit_no: "",
  manufacturer: "",
  model: "",
  screen_size: "",
};

function valuesFrom(sce: Sce): typeof emptyValues {
  return {
    project_id: sce.project_id,
    sort_order: String(sce.sort_order),
    type: sce.type,
    unit_no: String(sce.unit_no),
    manufacturer: sce.manufacturer ?? "",
    model: sce.model ?? "",
    screen_size: sce.screen_size ?? "",
  };
}

// A blank text field clears the value (`null`); the API refuses an empty string.
const toNullable = (text: string) => (text.trim() === "" ? null : text);

// The two uniqueness rules each point at their own field.
const TAKEN_CODE_FIELDS: Record<string, string> = {
  SCE_SORT_ORDER_TAKEN: "sort_order",
  SCE_UNIT_NO_TAKEN: "unit_no",
};

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
  const takenField = TAKEN_CODE_FIELDS[error.code];
  if (takenField) {
    return { form: undefined, fields: { [takenField]: error.message } };
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

/** Creates a unit, or edits `sce` when one is given. */
export function SceForm({ sce, onSaved }: { sce?: Sce; onSaved: () => void }) {
  const createSce = useCreateSce();
  const updateSce = useUpdateSce();
  // The API allows at most 100 per page.
  const projects = useProjects({ page: 1, pageSize: 100, archived: false });
  const projectOptions = (projects.data?.data ?? []).map((project) => ({
    value: project.id,
    label: project.name,
  }));

  // A new unit starts in the project chosen in the header.
  const { projectId: headerProjectId } = useProjectFilter();

  const form = useForm({
    defaultValues: sce
      ? valuesFrom(sce)
      : { ...emptyValues, project_id: headerProjectId ?? "" },
    validators: {
      // Server-side validation: the API is the only place the rules live.
      onSubmitAsync: async ({ value }) => {
        const body = {
          project_id: value.project_id,
          // Left out on create, the API puts the unit last. On edit they are always filled.
          ...(value.sort_order === ""
            ? {}
            : { sort_order: Number(value.sort_order) }),
          type: value.type,
          ...(value.unit_no === "" ? {} : { unit_no: Number(value.unit_no) }),
          manufacturer: toNullable(value.manufacturer),
          model: toNullable(value.model),
          screen_size: toNullable(value.screen_size),
        };
        try {
          if (sce) {
            await updateSce.mutateAsync({ id: sce.id, body });
          } else {
            await createSce.mutateAsync(body);
          }
        } catch (error) {
          return toServerErrors(error);
        }
        toast.add({
          type: "success",
          title: sce ? "Unit updated" : "Unit created",
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
                  placeholder={sce ? undefined : "Leave blank to add it last"}
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
                  options={SCE_TYPE_OPTIONS}
                  placeholder="Select a type"
                  value={field.state.value}
                  onValueChange={(value) =>
                    value && field.handleChange(value as SceType)
                  }
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="unit_no">
          {(field) => (
            <Field label="No." error={firstError(field.state.meta.errors)}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  placeholder={sce ? undefined : "Leave blank for the next one"}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="manufacturer">
          {(field) => (
            <Field
              label="Manufactured by"
              error={firstError(field.state.meta.errors)}
            >
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  placeholder="For example Swaco"
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
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="screen_size">
          {(field) => (
            <Field
              label="Screen size"
              error={firstError(field.state.meta.errors)}
            >
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  placeholder="For example 140/140/140/140"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                />
              )}
            </Field>
          )}
        </form.Field>

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
                ? sce
                  ? "Saving…"
                  : "Creating…"
                : sce
                  ? "Save changes"
                  : "Create unit"}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}

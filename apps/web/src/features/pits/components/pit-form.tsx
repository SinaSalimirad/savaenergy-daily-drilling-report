"use client";

import { useForm } from "@tanstack/react-form";
import { type ReactNode, useId } from "react";
import type { PitType } from "schema";
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
import { type Pit, useCreatePit, useUpdatePit } from "../api";
import { PIT_TYPE_OPTIONS } from "../labels";

// Numbers are kept as text while typing and converted on submit.
const emptyValues = {
  project_id: "",
  // Empty means "next free".
  order: "",
  name: "",
  type: "active" as PitType,
  // Empty means "not known".
  capacity: "",
};

function valuesFrom(pit: Pit): typeof emptyValues {
  return {
    project_id: pit.project_id,
    order: String(pit.order),
    name: pit.name,
    type: pit.type,
    capacity: pit.capacity === null ? "" : String(pit.capacity),
  };
}

// An empty capacity is sent as null: the capacity of a pit may be unknown.
const toCapacity = (text: string) => (text.trim() === "" ? null : Number(text));

const NAME_TAKEN_CODE = "PIT_NAME_TAKEN";

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

/** Creates a pit, or edits `pit` when one is given. */
export function PitForm({ pit, onSaved }: { pit?: Pit; onSaved: () => void }) {
  const createPit = useCreatePit();
  const updatePit = useUpdatePit();
  // The API allows at most 100 per page.
  const projects = useProjects({ page: 1, pageSize: 100, archived: false });
  const projectOptions = (projects.data?.data ?? []).map((project) => ({
    value: project.id,
    label: project.name,
  }));

  // A new pit starts in the project chosen in the header.
  const { projectId: headerProjectId } = useProjectFilter();

  const form = useForm({
    defaultValues: pit
      ? valuesFrom(pit)
      : { ...emptyValues, project_id: headerProjectId ?? "" },
    validators: {
      // Server-side validation: the API is the only place the rules live.
      onSubmitAsync: async ({ value }) => {
        const body = {
          project_id: value.project_id,
          // Left out on create, the API puts the pit last. On edit it is always filled.
          ...(value.order === "" ? {} : { order: Number(value.order) }),
          name: value.name,
          type: value.type,
          capacity: toCapacity(value.capacity),
        };
        try {
          if (pit) {
            await updatePit.mutateAsync({ id: pit.id, body });
          } else {
            await createPit.mutateAsync(body);
          }
        } catch (error) {
          return toServerErrors(error);
        }
        toast.add({
          type: "success",
          title: pit ? "Pit updated" : "Pit created",
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

        <form.Field name="order">
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
                  placeholder={pit ? undefined : "Leave blank to add it last"}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="name">
          {(field) => (
            <Field label="Name" error={firstError(field.state.meta.errors)}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  placeholder="For example Active 1"
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
                  options={PIT_TYPE_OPTIONS}
                  placeholder="Select a type"
                  value={field.state.value}
                  onValueChange={(value) =>
                    value && field.handleChange(value as PitType)
                  }
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="capacity">
          {(field) => (
            <Field
              label="Capacity (bbl)"
              error={firstError(field.state.meta.errors)}
            >
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Leave blank if not known"
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
                ? pit
                  ? "Saving…"
                  : "Creating…"
                : pit
                  ? "Save changes"
                  : "Create pit"}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}

"use client";

import { useForm } from "@tanstack/react-form";
import { type ReactNode, useId, useState } from "react";
import type { HoleType } from "schema";
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
import { useWells } from "@/features/wells/api";
import { ApiError } from "@/lib/api-error";
import { type Section, useCreateSection, useUpdateSection } from "../api";
import { HOLE_SIZE_OPTIONS, HOLE_TYPE_OPTIONS, NONE } from "../labels";

const emptyValues = {
  well_id: "",
  // Kept as text while typing; converted to a number on submit. Empty means "next free".
  sort_order: "",
  hole_size: "",
  hole_type: NONE as HoleType | typeof NONE,
};

function valuesFrom(section: Section): typeof emptyValues {
  return {
    well_id: section.well_id,
    sort_order: String(section.sort_order),
    hole_size: String(section.hole_size),
    hole_type: section.hole_type ?? NONE,
  };
}

const ORDER_TAKEN_CODE = "SECTION_SORT_ORDER_TAKEN";

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

/** Creates a section, or edits `section` when one is given. */
export function SectionForm({
  section,
  onSaved,
}: {
  section?: Section;
  onSaved: () => void;
}) {
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  // The API allows at most 100 per page; the select lists the wells.
  const wells = useWells({ page: 1, pageSize: 100 });
  const projects = useProjects({ page: 1, pageSize: 100, archived: false });
  const projectOptions = (projects.data?.data ?? []).map((project) => ({
    value: project.id,
    label: project.name,
  }));

  // The project only narrows the wells, it is not sent. Until one is chosen, an edited section
  // shows the project of its well, and a new one starts in the project chosen in the header.
  const { projectId: headerProjectId } = useProjectFilter();
  const [chosenProjectId, setChosenProjectId] = useState<string | null>(null);
  const projectId =
    chosenProjectId ??
    (section
      ? wells.data?.data.find((well) => well.id === section.well_id)?.project_id
      : headerProjectId) ??
    "";
  const wellOptions = (wells.data?.data ?? [])
    .filter((well) => well.project_id === projectId)
    .map((well) => ({ value: well.id, label: well.name }));

  const form = useForm({
    defaultValues: section ? valuesFrom(section) : emptyValues,
    validators: {
      // Server-side validation: the API is the only place the rules live.
      onSubmitAsync: async ({ value }) => {
        const body = {
          well_id: value.well_id,
          // Left out on create, the API puts the section last. On edit it is always filled.
          ...(value.sort_order === ""
            ? {}
            : { sort_order: Number(value.sort_order) }),
          // An empty size becomes NaN, which JSON sends as null: the API answers "Choose a hole size."
          hole_size:
            value.hole_size === "" ? Number.NaN : Number(value.hole_size),
          hole_type: value.hole_type === NONE ? null : value.hole_type,
        };
        try {
          if (section) {
            await updateSection.mutateAsync({ id: section.id, body });
          } else {
            await createSection.mutateAsync(body);
          }
        } catch (error) {
          return toServerErrors(error);
        }
        toast.add({
          type: "success",
          title: section ? "Section updated" : "Section created",
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
        <div>
          <Field label="Project">
            {({ id }) => (
              <Combobox
                items={projectOptions}
                value={
                  projectOptions.find((option) => option.value === projectId) ??
                  null
                }
                onValueChange={(option) => {
                  setChosenProjectId(option?.value ?? "");
                  // The chosen well may belong to another project.
                  form.setFieldValue("well_id", "");
                }}
              >
                <ComboboxInput
                  id={id}
                  className="h-9 w-full rounded-md bg-transparent shadow-xs"
                  placeholder="Search for a project"
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

        <form.Field name="well_id">
          {(field) => (
            <div>
              <Field label="Well" error={firstError(field.state.meta.errors)}>
                {({ id, invalid }) => (
                  <Combobox
                    items={wellOptions}
                    value={
                      wellOptions.find(
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
                      placeholder={
                        projectId
                          ? "Search for a well"
                          : "Select a project first"
                      }
                      aria-invalid={invalid}
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>
                        {projectId
                          ? "No wells in this project."
                          : "Select a project first."}
                      </ComboboxEmpty>
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
            <Field label="Order" error={firstError(field.state.meta.errors)}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  placeholder={
                    section ? undefined : "Leave blank to add it last"
                  }
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="hole_size">
          {(field) => (
            <Field
              label="Hole size"
              error={firstError(field.state.meta.errors)}
            >
              {({ id, invalid }) => (
                <SimpleSelect
                  id={id}
                  invalid={invalid}
                  options={HOLE_SIZE_OPTIONS}
                  placeholder="Select a hole size"
                  value={field.state.value || null}
                  onValueChange={(value) => value && field.handleChange(value)}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="hole_type">
          {(field) => (
            <Field
              label="Hole type"
              error={firstError(field.state.meta.errors)}
            >
              {({ id, invalid }) => (
                <SimpleSelect
                  id={id}
                  invalid={invalid}
                  options={HOLE_TYPE_OPTIONS}
                  placeholder="Select a type"
                  value={field.state.value}
                  onValueChange={(value) =>
                    value && field.handleChange(value as HoleType)
                  }
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
                ? section
                  ? "Saving…"
                  : "Creating…"
                : section
                  ? "Save changes"
                  : "Create section"}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}

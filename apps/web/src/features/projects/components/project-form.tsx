"use client";

import { useForm } from "@tanstack/react-form";
import { type ReactNode, useId } from "react";
import type { ProjectCurrency, ProjectWritableStatus } from "schema";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-error";
import { type Project, useCreateProject, useUpdateProject } from "../api";
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY } from "../currencies";
import { normalizeNames } from "../names";

type Status = ProjectWritableStatus;
type Currency = ProjectCurrency;

const emptyValues = {
  name: "",
  field: "",
  operator: "",
  contractor: "",
  // Kept as text while typing; converted to a number on submit.
  wells: "",
  status: "planned" as Status,
  currency: DEFAULT_CURRENCY as Currency,
};

function valuesFrom(project: Project): typeof emptyValues {
  return {
    name: project.name,
    field: project.field ?? "",
    operator: project.operator,
    contractor: project.contractor,
    wells: String(project.wells),
    // Archived projects cannot be edited (see the actions menu), so this is never "archived".
    status: project.status as Status,
    currency: project.currency as Currency,
  };
}

// The API is the source of truth for validation: this form only collects text and shows
// the messages the API sends back, so the rules live in one place.
const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const NAME_TAKEN_CODE = "PROJECT_NAME_TAKEN";

type FieldProps = {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: (props: { id: string; invalid: boolean }) => ReactNode;
};

function Field({ label, error, hint, children }: FieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-medium text-sm">
        {label}
      </label>
      {children({ id, invalid: Boolean(error) })}
      {hint && !error && (
        <p className="text-muted-foreground text-xs">{hint}</p>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}

// Shows the comma rule with the example names in bold.
function NamesHint({ examples }: { examples: string[] }) {
  return (
    <>
      Separate multiple names with commas, e.g.{" "}
      {examples.map((name, index) => (
        <span key={name}>
          {index > 0 && ", "}
          <strong className="font-semibold text-foreground">{name}</strong>
        </span>
      ))}
    </>
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
  // Field messages are enough when the API pointed at specific fields.
  const hasFieldErrors = Object.keys(error.fieldErrors).length > 0;
  return {
    form: hasFieldErrors ? undefined : error.message,
    fields: error.fieldErrors,
  };
}

// Errors come from the API (see `onSubmitAsync`), so they are plain strings.
const firstError = (errors: unknown[]) =>
  errors.find((error): error is string => typeof error === "string");

/** Creates a project, or edits `project` when one is given. */
export function ProjectForm({
  project,
  onSaved,
}: {
  project?: Project;
  onSaved: () => void;
}) {
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const form = useForm({
    defaultValues: project ? valuesFrom(project) : emptyValues,
    validators: {
      // Server-side validation: the API is the only place the rules live. Returning
      // `{ form, fields }` puts its messages on the form and on the matching inputs.
      onSubmitAsync: async ({ value }) => {
        const body = {
          ...value,
          operator: normalizeNames(value.operator),
          contractor: normalizeNames(value.contractor),
          // An empty box becomes NaN-free 0 here, and the API rejects it as "not positive".
          wells: Number(value.wells),
        };
        try {
          if (project) {
            await updateProject.mutateAsync({ id: project.id, body });
          } else {
            await createProject.mutateAsync(body);
          }
        } catch (error) {
          return toServerErrors(error);
        }
        toast.add({
          type: "success",
          title: project ? "Project updated" : "Project created",
        });
        onSaved();
        return undefined;
      },
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto"
    >
      <div className="grid gap-4 px-4 sm:grid-cols-2">
        <form.Field name="name">
          {(field) => (
            <Field
              label="Project name"
              error={firstError(field.state.meta.errors)}
            >
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  placeholder="e.g. South Pars Phase 14"
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

        <form.Field name="field">
          {(field) => (
            <Field
              label="Field name"
              error={firstError(field.state.meta.errors)}
            >
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  placeholder="e.g. South Pars"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="operator">
          {(field) => (
            <Field
              label="Operator(s)"
              error={firstError(field.state.meta.errors)}
              hint={<NamesHint examples={["Shell", "TotalEnergies"]} />}
            >
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  placeholder="e.g. Shell, TotalEnergies"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="contractor">
          {(field) => (
            <Field
              label="Contractor(s)"
              error={firstError(field.state.meta.errors)}
              hint={<NamesHint examples={["Halliburton", "Schlumberger"]} />}
            >
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  placeholder="e.g. Halliburton, Schlumberger"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="wells">
          {(field) => (
            <Field
              label="Number of wells"
              error={firstError(field.state.meta.errors)}
            >
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  placeholder="e.g. 12"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
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
                    value && field.handleChange(value as Status)
                  }
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="currency">
          {(field) => (
            <Field label="Currency" error={firstError(field.state.meta.errors)}>
              {({ id, invalid }) => (
                <SimpleSelect
                  id={id}
                  invalid={invalid}
                  options={CURRENCY_OPTIONS}
                  placeholder="Select a currency"
                  value={field.state.value}
                  onValueChange={(value) =>
                    value && field.handleChange(value as Currency)
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
                ? project
                  ? "Saving…"
                  : "Creating…"
                : project
                  ? "Save changes"
                  : "Create project"}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}

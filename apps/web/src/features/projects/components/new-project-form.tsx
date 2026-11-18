"use client";

import { type FormEvent, type ReactNode, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-error";
import { type CreateProjectBody, useCreateProject } from "../api";
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY } from "../currencies";
import { normalizeNames } from "../names";

type Status = CreateProjectBody["status"];

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

export function NewProjectForm({ onCreated }: { onCreated: () => void }) {
  const createProject = useCreateProject();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("planned");
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "");
    const field = text("field");

    setFieldErrors({});
    setFormError(null);

    createProject.mutate(
      {
        name: text("name"),
        operator: normalizeNames(text("operator")),
        contractor: normalizeNames(text("contractor")),
        // The database column is NOT NULL, so the field is always sent. An empty value
        // gets the API's own validation message.
        field,
        status,
        currency,
      },
      {
        onSuccess: () => {
          toast.add({ type: "success", title: "Project created" });
          onCreated();
        },
        onError: (error) => {
          if (!(error instanceof ApiError)) return setFormError(error.message);
          if (error.code === NAME_TAKEN_CODE) {
            return setFieldErrors({ name: error.message });
          }
          setFieldErrors(error.fieldErrors);
          // Field messages are enough when the API pointed at specific fields.
          if (Object.keys(error.fieldErrors).length === 0) {
            setFormError(error.message);
          }
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto"
    >
      <div className="grid gap-4 px-4 sm:grid-cols-2">
        <Field label="Project name" error={fieldErrors.name}>
          {({ id, invalid }) => (
            <Input id={id} name="name" aria-invalid={invalid} autoFocus />
          )}
        </Field>
        <Field label="Field name" error={fieldErrors.field}>
          {({ id, invalid }) => (
            <Input id={id} name="field" aria-invalid={invalid} />
          )}
        </Field>
        <Field
          label="Operator(s)"
          error={fieldErrors.operator}
          hint={<NamesHint examples={["Shell", "TotalEnergies"]} />}
        >
          {({ id, invalid }) => (
            <Input id={id} name="operator" aria-invalid={invalid} />
          )}
        </Field>
        <Field
          label="Contractor(s)"
          error={fieldErrors.contractor}
          hint={<NamesHint examples={["Halliburton", "Schlumberger"]} />}
        >
          {({ id, invalid }) => (
            <Input id={id} name="contractor" aria-invalid={invalid} />
          )}
        </Field>
        <Field label="Status" error={fieldErrors.status}>
          {({ id, invalid }) => (
            <SimpleSelect
              id={id}
              invalid={invalid}
              options={STATUS_OPTIONS}
              value={status}
              onValueChange={(value) => value && setStatus(value as Status)}
            />
          )}
        </Field>
        <Field label="Currency" error={fieldErrors.currency}>
          {({ id, invalid }) => (
            <SimpleSelect
              id={id}
              invalid={invalid}
              options={CURRENCY_OPTIONS}
              value={currency}
              onValueChange={(value) => value && setCurrency(value)}
            />
          )}
        </Field>

        {formError && (
          <p className="text-destructive text-sm sm:col-span-2">{formError}</p>
        )}
      </div>

      <DialogFooter className="flex-row justify-end">
        <DialogClose render={<Button variant="outline" type="button" />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={createProject.isPending}>
          {createProject.isPending ? "Creating…" : "Create project"}
        </Button>
      </DialogFooter>
    </form>
  );
}

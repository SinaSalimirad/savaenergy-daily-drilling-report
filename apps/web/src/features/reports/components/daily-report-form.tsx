"use client";

import { useForm } from "@tanstack/react-form";
import { type ReactNode, useId, useState } from "react";
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
import { toast } from "@/components/ui/toast";
import { useProjects } from "@/features/projects/api";
import { useProjectFilter } from "@/features/projects/project-filter";
import { useWells } from "@/features/wells/api";
import { ApiError } from "@/lib/api-error";
import {
  type DailyReport,
  useCreateDailyReport,
  useUpdateDailyReport,
} from "../api";
import { SectionSelect } from "./section-select";

const emptyValues = {
  well_id: "",
  section_id: "",
  // Kept as text while typing; converted to a number on submit. Empty means "next free".
  report_no: "",
  report_date: "",
  bit_depth_m: "",
  bit_td_m: "",
  bit_tvd_m: "",
};

const depthText = (depth: number | null) =>
  depth === null ? "" : String(depth);

function valuesFrom(report: DailyReport): typeof emptyValues {
  return {
    well_id: report.well_id,
    section_id: report.section_id,
    report_no: String(report.report_no),
    report_date: report.report_date,
    bit_depth_m: depthText(report.bit_depth_m),
    bit_td_m: depthText(report.bit_td_m),
    bit_tvd_m: depthText(report.bit_tvd_m),
  };
}

// An empty depth clears the stored value; the API accepts `null`.
const depthNumber = (text: string) => (text === "" ? null : Number(text));

// API error codes that belong to one field instead of the whole form.
const FIELD_OF_ERROR_CODE: Record<string, string> = {
  DAILY_REPORT_DATE_TAKEN: "report_date",
  DAILY_REPORT_NUMBER_TAKEN: "report_no",
  SECTION_NOT_IN_WELL: "section_id",
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
  const field = FIELD_OF_ERROR_CODE[error.code];
  if (field) return { form: undefined, fields: { [field]: error.message } };
  const hasFieldErrors = Object.keys(error.fieldErrors).length > 0;
  return {
    form: hasFieldErrors ? undefined : error.message,
    fields: error.fieldErrors,
  };
}

// Errors come from the API (see `onSubmitAsync`), so they are plain strings.
const firstError = (errors: unknown[]) =>
  errors.find((error): error is string => typeof error === "string");

/** A depth in meters, typed as text and converted on submit. */
function DepthField({
  form,
  name,
  label,
}: {
  form: ReturnType<typeof useDailyReportForm>;
  name: "bit_depth_m" | "bit_td_m" | "bit_tvd_m";
  label: string;
}) {
  return (
    <form.Field name={name}>
      {(field) => (
        <Field label={label} error={firstError(field.state.meta.errors)}>
          {({ id, invalid }) => (
            <Input
              id={id}
              name={field.name}
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="e.g. 1250.5"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={invalid}
            />
          )}
        </Field>
      )}
    </form.Field>
  );
}

function useDailyReportForm(
  report: DailyReport | undefined,
  onSaved: () => void,
) {
  const createReport = useCreateDailyReport();
  const updateReport = useUpdateDailyReport();

  return useForm({
    defaultValues: report ? valuesFrom(report) : emptyValues,
    validators: {
      // Server-side validation: the API is the only place the rules live.
      onSubmitAsync: async ({ value }) => {
        const details = {
          section_id: value.section_id,
          report_date: value.report_date,
          bit_depth_m: depthNumber(value.bit_depth_m),
          bit_td_m: depthNumber(value.bit_td_m),
          bit_tvd_m: depthNumber(value.bit_tvd_m),
        };
        // Left out on create, the API gives the report the next number of its well.
        const reportNo =
          value.report_no === "" ? {} : { report_no: Number(value.report_no) };

        try {
          if (report) {
            // A report cannot move to another well, so `well_id` is not sent on edit.
            await updateReport.mutateAsync({
              id: report.id,
              body: { ...details, ...reportNo },
            });
          } else {
            await createReport.mutateAsync({
              well_id: value.well_id,
              ...details,
              ...reportNo,
            });
          }
        } catch (error) {
          return toServerErrors(error);
        }
        toast.add({
          type: "success",
          title: report ? "Report updated" : "Report created",
        });
        onSaved();
        return undefined;
      },
    },
  });
}

/** Creates a daily report, or edits `report` when one is given. */
export function DailyReportForm({
  report,
  onSaved,
}: {
  report?: DailyReport;
  onSaved: () => void;
}) {
  const form = useDailyReportForm(report, onSaved);
  // The API allows at most 100 per page; the select lists the wells.
  const wells = useWells({ page: 1, pageSize: 100 });
  const projects = useProjects({ page: 1, pageSize: 100, archived: false });
  const projectOptions = (projects.data?.data ?? []).map((project) => ({
    value: project.id,
    label: project.name,
  }));

  // The project only narrows the wells, it is not sent. A new report starts with the project
  // chosen in the header; an existing one shows the project of its well.
  const { projectId: headerProjectId } = useProjectFilter();
  const [chosenProjectId, setChosenProjectId] = useState<string | null>(null);
  const projectId =
    chosenProjectId ??
    (report
      ? wells.data?.data.find((well) => well.id === report.well_id)?.project_id
      : headerProjectId) ??
    "";
  const wellOptions = (wells.data?.data ?? [])
    .filter((well) => well.project_id === projectId)
    .map((well) => ({ value: well.id, label: well.name }));
  // The well of an existing report may be beyond the first 100: keep it in the list so it shows.
  if (
    report &&
    !wellOptions.some((option) => option.value === report.well_id)
  ) {
    wellOptions.unshift({ value: report.well_id, label: report.well_name });
  }

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
                // The chosen well and its section may belong to another project.
                form.setFieldValue("well_id", "");
                form.setFieldValue("section_id", "");
              }}
            >
              <ComboboxInput
                id={id}
                className="h-9 w-full rounded-md bg-transparent shadow-xs"
                placeholder="Search for a project"
                // A report stays with its well, and so with its project.
                disabled={Boolean(report)}
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

        <form.Field name="well_id">
          {(field) => (
            <Field label="Well" error={firstError(field.state.meta.errors)}>
              {({ id, invalid }) => (
                <Combobox
                  items={wellOptions}
                  value={
                    wellOptions.find(
                      (option) => option.value === field.state.value,
                    ) ?? null
                  }
                  onValueChange={(option) => {
                    field.handleChange(option?.value ?? "");
                    // A section belongs to one well: the old choice is wrong for the new well.
                    form.setFieldValue("section_id", "");
                  }}
                >
                  <ComboboxInput
                    id={id}
                    // Same height, radius and shadow as the other inputs.
                    className="h-9 w-full rounded-md bg-transparent shadow-xs"
                    placeholder={
                      projectId ? "Search for a well" : "Select a project first"
                    }
                    // A report stays with its well.
                    disabled={Boolean(report)}
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
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.well_id}>
          {(wellId) => (
            <form.Field name="section_id">
              {(field) => (
                <Field
                  label="Section"
                  error={firstError(field.state.meta.errors)}
                >
                  {({ id, invalid }) => (
                    <SectionSelect
                      id={id}
                      invalid={invalid}
                      wellId={wellId}
                      value={field.state.value}
                      onChange={field.handleChange}
                    />
                  )}
                </Field>
              )}
            </form.Field>
          )}
        </form.Subscribe>

        <form.Field name="report_date">
          {(field) => (
            <Field label="Date" error={firstError(field.state.meta.errors)}>
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

        <form.Field name="report_no">
          {(field) => (
            <Field
              label="Report number"
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
                  placeholder={
                    report ? undefined : "Leave blank for the next number"
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

        <DepthField form={form} name="bit_depth_m" label="Bit depth (m)" />
        <DepthField form={form} name="bit_td_m" label="Bit TD (m)" />
        <DepthField form={form} name="bit_tvd_m" label="Bit TVD (m)" />

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
                ? report
                  ? "Saving…"
                  : "Creating…"
                : report
                  ? "Save changes"
                  : "Create report"}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}

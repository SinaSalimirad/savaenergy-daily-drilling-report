"use client";

import { formatHoleSize } from "schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { SelectedReport } from "../use-selected-report";

const ALL_SECTIONS = "";

function sectionLabel(section: { order: number; holeSize: number }) {
  return `${section.order} · ${formatHoleSize(section.holeSize)}`;
}

// A button that opens a list, like "Well: SP14". It looks like the buttons beside the title.
function PickerButton({
  label,
  shown,
  options,
  value,
  onChange,
}: {
  label: string;
  shown: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(next) => next && onChange(next)}
    >
      <SelectTrigger
        aria-label={label}
        className="h-10 w-auto gap-3 border-0 bg-card px-4 font-medium"
      >
        <span>
          <span className="text-muted-foreground">{label}: </span>
          {shown}
        </span>
      </SelectTrigger>
      <SelectContent className="w-max min-w-40 whitespace-nowrap">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Lets the user switch the well, its section and the report of a page built on
 * `useSelectedReport`. `showReport` hides the report button for pages scoped to the whole well
 * (the well's newest report is still used underneath, to read its cumulative numbers).
 * `showSection` adds a section filter, for a well that was drilled in more than one section.
 */
export function ReportPicker({
  selection,
  showReport = true,
  showSection = false,
}: {
  selection: SelectedReport;
  showReport?: boolean;
  showSection?: boolean;
}) {
  const { wells, well, sections, chosenSectionId, wellReports, report } =
    selection;
  if (!well || !report) return null;

  const chosenSection = sections.find((item) => item.id === chosenSectionId);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <PickerButton
        label="Well"
        shown={well.name}
        options={wells.map((item) => ({ value: item.id, label: item.name }))}
        value={well.id}
        onChange={selection.selectWell}
      />
      {showSection && sections.length > 1 && (
        <PickerButton
          label="Section"
          shown={chosenSection ? sectionLabel(chosenSection) : "All"}
          options={[
            { value: ALL_SECTIONS, label: "All" },
            ...sections.map((item) => ({
              value: item.id,
              label: sectionLabel(item),
            })),
          ]}
          value={chosenSectionId ?? ALL_SECTIONS}
          onChange={(value) =>
            selection.selectSection(value === ALL_SECTIONS ? null : value)
          }
        />
      )}
      {showReport && (
        <PickerButton
          label="Report"
          shown={`#${report.report_no}`}
          options={wellReports.map((item) => ({
            value: item.id,
            label: `#${item.report_no} · ${item.report_date}`,
          }))}
          value={report.id}
          onChange={selection.selectReport}
        />
      )}
    </div>
  );
}

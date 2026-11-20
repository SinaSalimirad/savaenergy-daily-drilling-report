"use client";

import { formatHoleSize } from "schema";
import { SimpleSelect } from "@/components/ui/select";
import { useWellSections } from "@/features/sections/api";
import { holeTypeLabel } from "@/features/sections/labels";

/** The sections of one well. Without a well, it stays disabled: there is nothing to choose. */
export function SectionSelect({
  id,
  invalid,
  wellId,
  value,
  onChange,
}: {
  id: string;
  invalid: boolean;
  wellId: string;
  value: string;
  onChange: (sectionId: string) => void;
}) {
  const sections = useWellSections(wellId);
  const options = (sections.data?.data ?? []).map((section) => ({
    value: section.id,
    label: [
      formatHoleSize(section.hole_size),
      section.hole_type ? holeTypeLabel(section.hole_type) : null,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  const placeholder = !wellId
    ? "Choose a well first"
    : sections.isPending
      ? "Loading sections…"
      : options.length === 0
        ? "This well has no sections"
        : "Select a section";

  return (
    <SimpleSelect
      id={id}
      invalid={invalid}
      disabled={!wellId || options.length === 0}
      options={options}
      placeholder={placeholder}
      value={value || null}
      onValueChange={(next) => next && onChange(next)}
    />
  );
}

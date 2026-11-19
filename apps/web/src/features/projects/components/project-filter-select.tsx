"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { useProjects } from "../api";
import { useProjectFilter } from "../project-filter";

type ProjectOption = { value: string; label: string };

// The way back to "no filter": picking it clears the project.
const ALL_PROJECTS: ProjectOption = { value: "", label: "All projects" };

/** Header control: a button that opens a searchable list of projects to filter the app by. */
export function ProjectFilterSelect() {
  const { projectId, setProjectId } = useProjectFilter();
  // The API allows at most 100 per page; the filter lists the projects that are not archived.
  const projects = useProjects({ page: 1, pageSize: 100, archived: false });

  const options: ProjectOption[] = [
    ALL_PROJECTS,
    ...(projects.data?.data ?? []).map((project) => ({
      value: project.id,
      label: project.name,
    })),
  ];
  const selected = options.find((option) => option.value === projectId) ?? null;

  // The saved project may be archived or deleted since: fall back to all projects.
  useEffect(() => {
    if (projects.data && projectId !== null && selected === null) {
      setProjectId(null);
    }
  }, [projects.data, projectId, selected, setProjectId]);

  return (
    <Combobox
      items={options}
      value={selected ?? ALL_PROJECTS}
      onValueChange={(option: ProjectOption | null) =>
        setProjectId(option?.value ? option.value : null)
      }
    >
      <ComboboxTrigger
        render={<Button variant="ghost" size="lg" />}
        aria-label="Filter by project"
        disabled={projects.isError}
        className="text-base"
      >
        {selected?.value ? selected.label : "Select Project"}
      </ComboboxTrigger>
      <ComboboxContent align="end" className="w-64">
        <ComboboxInput showTrigger={false} placeholder="Search projects" />
        <ComboboxEmpty>
          {projects.isPending ? "Loading projects…" : "No projects found."}
        </ComboboxEmpty>
        <ComboboxList>
          {(option: ProjectOption) => (
            <ComboboxItem key={option.value || "all"} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

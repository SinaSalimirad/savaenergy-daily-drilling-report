"use client";

import { cn } from "cn";
import { FolderIcon } from "lucide-react";
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

// "header": looks like a text field, with the size of the old search box. "page": same look as the
// other buttons next to a page title (the old Archive button), for use beside "New ..." buttons.
const TRIGGER_STYLES = {
  header: {
    variant: "outline",
    className:
      "h-10 w-48 justify-start gap-2 bg-transparent px-3 font-normal shadow-xs hover:bg-transparent sm:w-64 dark:bg-input/30",
  },
  page: { variant: "outline", className: "h-10 border-0 bg-card" },
} as const;

/** A button that opens a searchable list of projects to filter the app by. */
export function ProjectFilterSelect({
  appearance = "header",
}: {
  appearance?: keyof typeof TRIGGER_STYLES;
}) {
  const style = TRIGGER_STYLES[appearance];
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
        render={<Button variant={style.variant} size="lg" />}
        aria-label="Filter by project"
        disabled={projects.isError}
        className={style.className}
      >
        {appearance === "header" && (
          <FolderIcon className="text-muted-foreground" />
        )}
        <span
          className={cn(
            "flex-1 truncate text-left",
            appearance === "header" &&
              !selected?.value &&
              "text-muted-foreground",
          )}
        >
          {selected?.value ? selected.label : "Select Project"}
        </span>
      </ComboboxTrigger>
      <ComboboxContent
        align={appearance === "header" ? "start" : "end"}
        // The header list is exactly as wide as its button; beside a page title it keeps a fixed
        // width. The search box and the items are taller than the default, so they are easy to hit.
        className={cn(
          appearance === "header"
            ? "w-(--anchor-width) min-w-(--anchor-width)"
            : "w-64",
          "*:data-[slot=input-group]:h-10",
        )}
      >
        <ComboboxInput showTrigger={false} placeholder="Search projects" />
        <ComboboxEmpty>
          {projects.isPending ? "Loading projects…" : "No projects found."}
        </ComboboxEmpty>
        <ComboboxList>
          {(option: ProjectOption) => (
            <ComboboxItem
              key={option.value || "all"}
              value={option}
              className="py-2.5"
            >
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

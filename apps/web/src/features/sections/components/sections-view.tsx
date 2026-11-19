"use client";

import { ProjectFilterSelect } from "@/features/projects/components/project-filter-select";
import { NewSectionDialog } from "./new-section-dialog";
import { SectionsList } from "./sections-list";

export function SectionsView() {
  return (
    <main className="px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Sections</h2>
        <div className="flex items-center gap-2">
          <ProjectFilterSelect appearance="page" />
          <NewSectionDialog />
        </div>
      </div>

      <SectionsList />
    </main>
  );
}

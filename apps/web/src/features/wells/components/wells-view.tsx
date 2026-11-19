"use client";

import { ProjectFilterSelect } from "@/features/projects/components/project-filter-select";
import { NewWellDialog } from "./new-well-dialog";
import { WellsList } from "./wells-list";

export function WellsView() {
  return (
    <main className="px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Wells</h2>

        <div className="flex items-center gap-2">
          <ProjectFilterSelect appearance="page" />
          <NewWellDialog />
        </div>
      </div>

      <WellsList emptyMessage="No wells yet." />
    </main>
  );
}

"use client";

import { ProjectFilterSelect } from "@/features/projects/components/project-filter-select";
import { NewPitDialog } from "./new-pit-dialog";
import { PitsList } from "./pits-list";

export function PitsView() {
  return (
    <main className="px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Pits</h2>
        <div className="flex items-center gap-2">
          <ProjectFilterSelect appearance="page" />
          <NewPitDialog />
        </div>
      </div>

      <PitsList />
    </main>
  );
}

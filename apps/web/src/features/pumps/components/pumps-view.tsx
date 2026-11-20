"use client";

import { ProjectFilterSelect } from "@/features/projects/components/project-filter-select";
import { NewPumpDialog } from "./new-pump-dialog";
import { PumpsList } from "./pumps-list";

export function PumpsView() {
  return (
    <main className="px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Pumps</h2>
        <div className="flex items-center gap-2">
          <ProjectFilterSelect appearance="page" />
          <NewPumpDialog />
        </div>
      </div>

      <PumpsList />
    </main>
  );
}

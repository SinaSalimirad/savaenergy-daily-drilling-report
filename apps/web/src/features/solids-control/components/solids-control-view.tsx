"use client";

import { ProjectFilterSelect } from "@/features/projects/components/project-filter-select";
import { NewSceDialog } from "./new-sce-dialog";
import { SceList } from "./sce-list";

export function SolidsControlView() {
  return (
    <main className="px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Solids control</h2>
        <div className="flex items-center gap-2">
          <ProjectFilterSelect appearance="page" />
          <NewSceDialog />
        </div>
      </div>

      <SceList />
    </main>
  );
}

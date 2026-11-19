"use client";

import { NewSectionDialog } from "./new-section-dialog";
import { SectionsList } from "./sections-list";

export function SectionsView() {
  return (
    <main className="px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Sections</h2>
        <NewSectionDialog />
      </div>

      <SectionsList />
    </main>
  );
}

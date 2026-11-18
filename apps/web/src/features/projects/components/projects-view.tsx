"use client";

import { ArchiveIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useProjects } from "../api";
import { NewProjectDialog } from "./new-project-dialog";
import { ProjectsList } from "./projects-list";

export function ProjectsView() {
  // pageSize 1: only `meta.total` is needed for the badge, not the rows.
  const archived = useProjects({ page: 1, pageSize: 1, archived: true });

  return (
    <main className="px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Projects</h2>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-10 border-0 bg-card"
            nativeButton={false}
            render={<Link href="/dashboard/master-data/projects/archive" />}
          >
            <ArchiveIcon data-icon="inline-start" strokeWidth={1.5} />
            Archive projects
            {archived.data && (
              <span className="ml-1 inline-flex items-center justify-center rounded-md bg-muted px-2.5 py-1 font-medium text-muted-foreground tabular-nums">
                {archived.data.meta.total}
              </span>
            )}
          </Button>
          <NewProjectDialog />
        </div>
      </div>

      <ProjectsList archived={false} emptyMessage="No projects yet." />
    </main>
  );
}

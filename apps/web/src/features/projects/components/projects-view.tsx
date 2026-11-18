"use client";

import { ArchiveIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useProjects } from "../api";
import { NewProjectDialog } from "./new-project-dialog";
import { ProjectsTable } from "./projects-table";

const PAGE_SIZE = 10;

export function ProjectsView() {
  const [page, setPage] = useState(1);
  const projects = useProjects({ page, pageSize: PAGE_SIZE, archived: false });
  // pageSize 1: only `meta.total` is needed for the badge, not the rows.
  const archived = useProjects({ page: 1, pageSize: 1, archived: true });

  const total = projects.data?.meta.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Archiving the last row of the last page leaves that page empty: step back one page.
  useEffect(() => {
    if (page > lastPage) setPage(lastPage);
  }, [page, lastPage]);

  return (
    <main className="px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Projects</h2>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-10 border-0 bg-card"
            nativeButton={false}
            render={<Link href="#" />}
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

      <div className="mt-6">
        {projects.isPending && (
          <p className="text-muted-foreground">Loading projects…</p>
        )}

        {projects.isError && (
          <div className="flex items-center gap-3 rounded-lg bg-card p-4">
            <p className="text-destructive">{projects.error.message}</p>
            <Button variant="outline" onClick={() => projects.refetch()}>
              Try again
            </Button>
          </div>
        )}

        {projects.data && (
          <>
            <ProjectsTable data={projects.data.data} />
            {lastPage > 1 && (
              <div className="mt-4 flex items-center justify-end gap-3">
                <span className="text-muted-foreground tabular-nums">
                  Page {page} of {lastPage}
                </span>
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= lastPage}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

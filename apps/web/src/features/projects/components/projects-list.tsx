"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useProjects } from "../api";
import { ProjectsPagination } from "./projects-pagination";
import { ProjectsTable } from "./projects-table";

const DEFAULT_PAGE_SIZE = 10;

// Shared by the active and archived pages: loading, error, table and pagination.
export function ProjectsList({
  archived,
  emptyMessage,
}: {
  archived: boolean;
  emptyMessage: string;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const projects = useProjects({ page, pageSize, archived });

  const total = projects.data?.meta.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  // Archiving/restoring the last row of the last page leaves that page empty: step back one page.
  useEffect(() => {
    if (page > lastPage) setPage(lastPage);
  }, [page, lastPage]);

  return (
    <div className="mt-6">
      {projects.isPending && (
        // The status is for screen readers; sighted users see the placeholder rows.
        <div role="status" aria-label="Loading projects">
          <ProjectsTable data={[]} emptyMessage={emptyMessage} isLoading />
        </div>
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
          <ProjectsTable
            data={projects.data.data}
            emptyMessage={emptyMessage}
          />
          <ProjectsPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              // The old page number may not exist with the new size: start from the top.
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}

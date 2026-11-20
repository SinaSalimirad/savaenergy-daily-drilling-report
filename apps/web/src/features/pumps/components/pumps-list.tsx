"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectsPagination } from "@/features/projects/components/projects-pagination";
import { useProjectFilter } from "@/features/projects/project-filter";
import { usePumps } from "../api";
import { PumpsTable } from "./pumps-table";

const DEFAULT_PAGE_SIZE = 10;
const EMPTY_MESSAGE = "No pumps yet.";

// Loading, error, table and pagination.
export function PumpsList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { projectId } = useProjectFilter();
  const pumps = usePumps({
    page,
    pageSize,
    project_id: projectId ?? undefined,
  });

  // The old page number may not exist for another project: start from the top.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `projectId` is the trigger, not a value used inside.
  useEffect(() => setPage(1), [projectId]);

  const total = pumps.data?.meta.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  // Deleting the last row of the last page leaves that page empty: step back one page.
  useEffect(() => {
    if (page > lastPage) setPage(lastPage);
  }, [page, lastPage]);

  return (
    <div className="mt-6 rounded-xl bg-card px-3 py-5">
      {pumps.isPending && (
        // The status is for screen readers; sighted users see the placeholder rows.
        <div role="status" aria-label="Loading pumps">
          <PumpsTable data={[]} emptyMessage={EMPTY_MESSAGE} isLoading />
        </div>
      )}

      {pumps.isError && (
        <div className="flex items-center gap-3 p-4">
          <p className="text-destructive">{pumps.error.message}</p>
          <Button variant="outline" onClick={() => pumps.refetch()}>
            Try again
          </Button>
        </div>
      )}

      {pumps.data && (
        <>
          <PumpsTable data={pumps.data.data} emptyMessage={EMPTY_MESSAGE} />
          <ProjectsPagination
            itemLabel="pump(s)"
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

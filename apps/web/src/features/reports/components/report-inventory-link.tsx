"use client";

import { PackageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useProjectFilter } from "@/features/projects/project-filter";
import { useWells } from "@/features/wells/api";
import type { DailyReport } from "../api";

/** Opens the inventory sheet of one report. */
export function ReportInventoryLink({ report }: { report: DailyReport }) {
  const { projectId, setProjectId } = useProjectFilter();
  // The inventory page shows the project chosen in the header, so the link switches it to the
  // project of the report's well (the report only knows its well).
  const wells = useWells({ page: 1, pageSize: 100 });
  const reportProjectId = wells.data?.data.find(
    (well) => well.id === report.well_id,
  )?.project_id;

  return (
    <Button
      variant="outline"
      size="sm"
      nativeButton={false}
      role="link"
      render={
        <Link
          href={`/dashboard/inventory-and-cost/inventory?report=${report.id}`}
          onClick={() => {
            if (reportProjectId && reportProjectId !== projectId) {
              setProjectId(reportProjectId);
            }
          }}
        />
      }
    >
      <PackageIcon data-icon="inline-start" />
      Inventory
    </Button>
  );
}

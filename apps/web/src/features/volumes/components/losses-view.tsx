"use client";

import { Button } from "@/components/ui/button";
import { ReportSheetView } from "../../fluid-samples/components/report-sheet-view";
import { ReportValuesDialog } from "../../fluid-samples/components/report-values-dialog";
import { useSetMudLosses, useVolumeSheet } from "../api";
import { LOSS_DEFS, LOSS_ITEMS } from "../fields";
import { VolumeTable } from "./volume-table";

function Sheet({ reportId }: { reportId: string }) {
  const volumes = useVolumeSheet(reportId);
  if (volumes.isError) {
    return (
      <div className="flex items-center gap-3 p-4">
        <p className="text-destructive">{volumes.error.message}</p>
        <Button variant="outline" onClick={() => volumes.refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  if (volumes.isPending)
    return <p className="p-4 text-muted-foreground">Loading…</p>;
  return <VolumeTable sheet={volumes.data.data} items={LOSS_ITEMS} />;
}

function Toolbar({ reportId }: { reportId: string }) {
  const volumes = useVolumeSheet(reportId);
  const save = useSetMudLosses();
  return (
    <ReportValuesDialog
      title="Mud losses"
      description="Where mud was lost on this report. They are taken out of the volume accounting."
      triggerLabel="Edit losses"
      reportId={reportId}
      defs={LOSS_DEFS}
      values={volumes.data?.data.losses}
      save={save}
    />
  );
}

export function LossesView() {
  return (
    <ReportSheetView
      title="Losses"
      subject="losses"
      toolbar={(reportId) => <Toolbar reportId={reportId} />}
      sheet={(reportId) => <Sheet reportId={reportId} />}
    />
  );
}

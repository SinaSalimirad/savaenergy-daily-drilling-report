"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { type DailyReport, useDeleteDailyReport } from "../api";

export function DeleteDailyReportDialog({
  report,
  open,
  onOpenChange,
}: {
  report: DailyReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteReport = useDeleteDailyReport();

  function handleOpenChange(next: boolean) {
    // Keep the dialog open while the request runs, so it cannot be dismissed mid-delete.
    if (!next && deleteReport.isPending) return;
    if (!next) deleteReport.reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete daily report</DialogTitle>
          <DialogDescription>
            Delete report{" "}
            <strong className="text-foreground">{report.report_no}</strong> of{" "}
            <strong className="text-foreground">{report.well_name}</strong> (
            {report.report_date}) permanently? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {deleteReport.error && (
          <p className="px-4 text-destructive text-sm">
            {deleteReport.error.message}
          </p>
        )}
        <DialogFooter className="flex-row justify-end">
          <DialogClose
            render={<Button variant="outline" type="button" className="h-10" />}
          >
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            className="h-10"
            disabled={deleteReport.isPending}
            onClick={() =>
              deleteReport.mutate(report.id, {
                onSuccess: () => {
                  toast.add({ type: "success", title: "Report deleted" });
                  onOpenChange(false);
                },
              })
            }
          >
            {deleteReport.isPending ? "Deleting…" : "Delete report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

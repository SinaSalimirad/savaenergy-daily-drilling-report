"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DailyReport } from "../api";
import { DailyReportForm } from "./daily-report-form";

export function EditDailyReportDialog({
  report,
  open,
  onOpenChange,
}: {
  report: DailyReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The dialog unmounts its content when closed, so the form starts from the
          report's current values every time it opens. */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit daily report</DialogTitle>
          <DialogDescription>
            Change report {report.report_no} of {report.well_name}.
          </DialogDescription>
        </DialogHeader>
        <DailyReportForm report={report} onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

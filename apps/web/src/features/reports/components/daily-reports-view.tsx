"use client";

import { DailyReportsList } from "./daily-reports-list";
import { NewDailyReportDialog } from "./new-daily-report-dialog";

export function DailyReportsView() {
  return (
    <main className="px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Daily reports</h2>
        <NewDailyReportDialog />
      </div>

      <DailyReportsList />
    </main>
  );
}

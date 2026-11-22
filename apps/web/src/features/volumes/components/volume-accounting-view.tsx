"use client";

import { Button } from "@/components/ui/button";
import { ReportSheetView } from "../../fluid-samples/components/report-sheet-view";
import { ReportValuesDialog } from "../../fluid-samples/components/report-values-dialog";
import { formatNumber } from "../../hydraulics/format";
import {
  useSetVolumeAccounting,
  useVolumeSheet,
  type VolumeSheet,
} from "../api";
import { ACCOUNTING_DEFS, ACCOUNTING_ITEMS } from "../fields";
import { VolumeTable } from "./volume-table";

const STATUS_TEXT = {
  balanced: "Balanced",
  gain: "Gain: the pits hold more than the books",
  loss: "Loss: the pits hold less than the books",
} as const;

const STATUS_STYLE = {
  balanced: "text-emerald-600 dark:text-emerald-400",
  gain: "text-amber-600 dark:text-amber-400",
  loss: "text-destructive",
} as const;

function Balance({ sheet }: { sheet: VolumeSheet }) {
  if (sheet.status === null || sheet.pit_volume_bbl === null) {
    return (
      <p className="px-2 text-muted-foreground text-sm">
        Add the pit readings of this report to compare the books with the pits.
      </p>
    );
  }
  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-lg border border-border p-3">
        <dt className="text-muted-foreground text-sm">
          Pits (active + reserve)
        </dt>
        <dd className="font-semibold text-xl tabular-nums">
          {formatNumber(sheet.pit_volume_bbl, 2)} bbl
        </dd>
      </div>
      <div className="rounded-lg border border-border p-3">
        <dt className="text-muted-foreground text-sm">Pits minus end volume</dt>
        <dd className="font-semibold text-xl tabular-nums">
          {formatNumber(sheet.difference_bbl, 2)} bbl
        </dd>
      </div>
      <div className="rounded-lg border border-border p-3">
        <dt className="text-muted-foreground text-sm">Balance status</dt>
        <dd className={`font-semibold ${STATUS_STYLE[sheet.status]}`}>
          {STATUS_TEXT[sheet.status]}
        </dd>
      </div>
    </dl>
  );
}

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
  const sheet = volumes.data.data;
  return (
    <div className="flex flex-col gap-6">
      <VolumeTable sheet={sheet} items={ACCOUNTING_ITEMS} />
      <Balance sheet={sheet} />
      <p className="px-2 text-muted-foreground text-sm">
        End volume = start volume + received − return + built − total losses.
        Built is the water, the chemicals and the diesel added. The losses come
        from the Losses page. The pits are the pit readings of this report
        without the "not mud" pits; they are balanced within 1%.
      </p>
    </div>
  );
}

function Toolbar({ reportId }: { reportId: string }) {
  const volumes = useVolumeSheet(reportId);
  const save = useSetVolumeAccounting();
  return (
    <ReportValuesDialog
      title="Volume accounting"
      description="The volumes added to and taken from the mud on this report."
      triggerLabel="Edit volumes"
      reportId={reportId}
      defs={ACCOUNTING_DEFS}
      values={volumes.data?.data.accounting}
      save={save}
    />
  );
}

export function VolumeAccountingView() {
  return (
    <ReportSheetView
      title="Volume accounting"
      subject="volume accounting"
      toolbar={(reportId) => <Toolbar reportId={reportId} />}
      sheet={(reportId) => <Sheet reportId={reportId} />}
    />
  );
}

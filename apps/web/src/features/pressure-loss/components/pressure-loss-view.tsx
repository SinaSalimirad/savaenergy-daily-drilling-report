"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ReportSheetView } from "../../fluid-samples/components/report-sheet-view";
import {
  type PressureLoss,
  useHydraulicInput,
  usePressureLoss,
} from "../../hydraulics/api";
import {
  FLOW_FIELDS,
  HydraulicInputsDialog,
} from "../../hydraulics/components/hydraulic-inputs-dialog";
import { MissingList } from "../../hydraulics/components/missing-list";
import {
  type RowColumn,
  RowTable,
} from "../../hydraulics/components/row-table";
import { formatNumber } from "../../hydraulics/format";

type Result = NonNullable<PressureLoss["result"]>;
type Pipe = Result["pipe"][number] & { id: string };
type Annulus = Result["annulus"][number] & { id: string };

const REGIME_LABELS = {
  laminar: "Laminar",
  transition: "Transition",
  turbulent: "Turbulent",
} as const;

const PIPE_COLUMNS: RowColumn<Pipe>[] = [
  { header: "Tool", render: (row) => row.tool_type },
  { header: "From (m)", render: (row) => formatNumber(row.from_md_m, 1) },
  { header: "To (m)", render: (row) => formatNumber(row.to_md_m, 1) },
  { header: "I.D. (in)", render: (row) => row.id_in },
  {
    header: "Velocity (m/min)",
    render: (row) => formatNumber(row.velocity_m_min, 1),
  },
  { header: "Reynolds", render: (row) => row.reynolds.toLocaleString("en-US") },
  { header: "Flow", render: (row) => REGIME_LABELS[row.regime] },
  {
    header: "Loss (psi)",
    render: (row) => formatNumber(row.pressure_loss_psi, 1),
  },
];

const ANNULUS_COLUMNS: RowColumn<Annulus>[] = [
  { header: "From (m)", render: (row) => formatNumber(row.from_md_m, 1) },
  { header: "To (m)", render: (row) => formatNumber(row.to_md_m, 1) },
  { header: "Hole (in)", render: (row) => row.hole_id_in },
  { header: "Pipe O.D. (in)", render: (row) => row.pipe_od_in },
  {
    header: "Velocity (m/min)",
    render: (row) => formatNumber(row.velocity_m_min, 1),
  },
  { header: "Reynolds", render: (row) => row.reynolds.toLocaleString("en-US") },
  { header: "Flow", render: (row) => REGIME_LABELS[row.regime] },
  {
    header: "Loss (psi)",
    render: (row) => formatNumber(row.pressure_loss_psi, 1),
  },
];

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="font-semibold text-xl tabular-nums">
        {value}{" "}
        <span className="font-normal text-muted-foreground text-sm">
          {unit}
        </span>
      </dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="px-2 pb-2 font-semibold text-lg">{title}</h3>
      {children}
    </section>
  );
}

function Results({ result }: { result: Result }) {
  const pipe = result.pipe.map((item, index) => ({
    ...item,
    id: `pipe-${index}`,
  }));
  const annulus = result.annulus.map((item, index) => ({
    ...item,
    id: `annulus-${index}`,
  }));
  return (
    <div className="flex flex-col gap-8">
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total pressure loss"
          value={formatNumber(result.total_pressure_loss_psi, 0)}
          unit="psi"
        />
        <Stat
          label="ECD at the bit"
          value={formatNumber(result.ecd_at_bit_pcf, 2)}
          unit="pcf"
        />
        <Stat
          label="ECD at the shoe"
          value={formatNumber(result.ecd_at_shoe_pcf, 2)}
          unit="pcf"
        />
        <Stat
          label="Bit HHP / HSI"
          value={`${formatNumber(result.bit.hhp, 0)} / ${formatNumber(result.bit.hsi, 2)}`}
          unit="hp / hp/in²"
        />
      </dl>

      <Section title="Inside the drill string">
        <RowTable
          rows={pipe}
          columns={PIPE_COLUMNS}
          emptyMessage="No drill string."
          footer={[
            "Total",
            "",
            "",
            "",
            "",
            "",
            "",
            formatNumber(result.pipe_pressure_loss_psi, 1),
          ]}
        />
      </Section>

      <Section title="Annulus">
        <RowTable
          rows={annulus}
          columns={ANNULUS_COLUMNS}
          emptyMessage="No annulus."
          footer={[
            "Total",
            "",
            "",
            "",
            "",
            "",
            "",
            formatNumber(result.annulus_pressure_loss_psi, 1),
          ]}
        />
      </Section>

      <Section title="Bit">
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="TFA"
            value={formatNumber(result.bit.tfa_in2, 3)}
            unit="in²"
          />
          <Stat
            label="Pressure loss"
            value={formatNumber(result.bit.pressure_loss_psi, 1)}
            unit="psi"
          />
          <Stat
            label="Jet velocity"
            value={formatNumber(result.bit.jet_velocity_m_s, 1)}
            unit="m/s"
          />
          <Stat
            label="Impact force"
            value={formatNumber(result.bit.impact_force_lbf, 0)}
            unit="lbf"
          />
        </dl>
      </Section>

      <p className="px-2 text-muted-foreground text-sm">
        Power-law model of API RP 13D. The pipe uses the 600/300 rpm readings
        and the annulus the 100/3 rpm readings of the latest rheology sample.
        Surface lines and the motor are not counted.
      </p>
    </div>
  );
}

function Sheet({ reportId }: { reportId: string }) {
  const pressure = usePressureLoss(reportId);
  if (pressure.isError) {
    return (
      <div className="flex items-center gap-3 p-4">
        <p className="text-destructive">{pressure.error.message}</p>
        <Button variant="outline" onClick={() => pressure.refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  if (pressure.isPending)
    return <p className="p-4 text-muted-foreground">Calculating…</p>;
  const { missing, result } = pressure.data.data;
  if (!result) return <MissingList missing={missing} />;
  return <Results result={result} />;
}

function Toolbar({ reportId }: { reportId: string }) {
  const input = useHydraulicInput(reportId);
  return (
    <HydraulicInputsDialog
      reportId={reportId}
      defs={FLOW_FIELDS}
      input={input.data?.data}
    />
  );
}

export function PressureLossView() {
  return (
    <ReportSheetView
      title="Pressure loss"
      subject="pressure loss"
      toolbar={(reportId) => <Toolbar reportId={reportId} />}
      sheet={(reportId) => <Sheet reportId={reportId} />}
    />
  );
}

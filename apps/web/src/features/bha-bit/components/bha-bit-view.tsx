"use client";

import { Button } from "@/components/ui/button";
import { bindMutation } from "../../fluid-samples/bind-mutation";
import { ReportSheetView } from "../../fluid-samples/components/report-sheet-view";
import {
  NewSampleDialog,
  SampleActions,
} from "../../fluid-samples/components/sample-dialogs";
import { displayValue } from "../../fluid-samples/fields";
import {
  type RowColumn,
  RowTable,
} from "../../hydraulics/components/row-table";
import { formatNumber } from "../../hydraulics/format";
import {
  type Bit,
  useBits,
  useCreateBit,
  useDeleteBit,
  useUpdateBit,
} from "../bit-api";
import {
  type DrillStringTool,
  useCreateDrillStringTool,
  useDeleteDrillStringTool,
  useDrillStringTools,
  useUpdateDrillStringTool,
} from "../drill-string-api";
import {
  BIT_DEFS,
  bitToBody,
  bitToValues,
  DRILL_STRING_DEFS,
  nozzlesText,
} from "../fields";

const TOOL = "drill string tool";
const BIT = "bit";

const TOOL_COLUMNS: RowColumn<DrillStringTool>[] = [
  { header: "Row", render: (row) => row.order },
  { header: "Tool type", render: (row) => row.tool_type },
  { header: "Length (m)", render: (row) => formatNumber(row.length_m, 2) },
  { header: "O.D. (in)", render: (row) => displayValue(row.od_in) },
  { header: "I.D. (in)", render: (row) => displayValue(row.id_in) },
  {
    header: "Steel (bbl)",
    computed: true,
    render: (row) => formatNumber(row.steel_volume_bbl, 2),
  },
  {
    header: "Internal (bbl)",
    computed: true,
    render: (row) => formatNumber(row.internal_volume_bbl, 2),
  },
  {
    header: "Displacement (bbl)",
    computed: true,
    render: (row) => formatNumber(row.displacement_bbl, 2),
  },
];

const BIT_COLUMNS: RowColumn<Bit>[] = [
  { header: "Bit type", render: (row) => row.bit_type },
  { header: "Size (in)", render: (row) => displayValue(row.size_in) },
  {
    header: "Manufactured by",
    render: (row) => displayValue(row.manufacturer),
  },
  { header: "Nozzles", render: (row) => nozzlesText(row.nozzles) || "—" },
  {
    header: "TFA (in²)",
    computed: true,
    render: (row) => formatNumber(row.tfa_in2, 3),
  },
];

function ToolActions({ tool }: { tool: DrillStringTool }) {
  const update = useUpdateDrillStringTool();
  const remove = useDeleteDrillStringTool();
  return (
    <SampleActions
      what={TOOL}
      rowName={`row ${tool.order}`}
      defs={DRILL_STRING_DEFS}
      row={tool}
      update={bindMutation(update, (body) => ({ id: tool.id, body }))}
      remove={bindMutation(remove, () => tool.id)}
    />
  );
}

function BitActions({ bit }: { bit: Bit }) {
  const update = useUpdateBit();
  const remove = useDeleteBit();
  return (
    <SampleActions
      what={BIT}
      rowName="the bit"
      defs={BIT_DEFS}
      row={bit}
      toValues={bitToValues}
      toBody={bitToBody}
      update={bindMutation(update, (body) => ({ id: bit.id, body }))}
      remove={bindMutation(remove, () => bit.id)}
    />
  );
}

function Toolbar({ reportId }: { reportId: string }) {
  const createTool = useCreateDrillStringTool();
  const createBit = useCreateBit();
  const bits = useBits(reportId);
  return (
    <>
      <NewSampleDialog
        what={TOOL}
        defs={DRILL_STRING_DEFS}
        create={createTool}
        parent={{ report_id: reportId }}
        triggerLabel="New tool"
      />
      {/* A report has one bit: with one, it is edited from its row. */}
      {bits.data?.data.length === 0 && (
        <NewSampleDialog
          what={BIT}
          defs={BIT_DEFS}
          create={createBit}
          parent={{ report_id: reportId }}
          triggerLabel="New bit"
          toBody={bitToBody}
        />
      )}
    </>
  );
}

function ErrorLine({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <p className="text-destructive">{message}</p>
      <Button variant="outline" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}

function Sheet({ reportId }: { reportId: string }) {
  const tools = useDrillStringTools(reportId);
  const bits = useBits(reportId);
  const toolRows = tools.data?.data ?? [];
  const sum = (pick: (tool: DrillStringTool) => number) =>
    toolRows.reduce((total, tool) => total + pick(tool), 0);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="px-2 pb-2 font-semibold text-lg">Drill string (BHA)</h3>
        {tools.isError ? (
          <ErrorLine
            message={tools.error.message}
            retry={() => tools.refetch()}
          />
        ) : (
          <RowTable
            rows={toolRows}
            columns={TOOL_COLUMNS}
            isLoading={tools.isPending}
            emptyMessage="No tools in this report yet. Use “New tool” to add one."
            renderActions={(row) => <ToolActions tool={row} />}
            footer={[
              "Total",
              "",
              formatNumber(
                sum((tool) => tool.length_m),
                2,
              ),
              "",
              "",
              formatNumber(
                sum((tool) => tool.steel_volume_bbl),
                2,
              ),
              formatNumber(
                sum((tool) => tool.internal_volume_bbl),
                2,
              ),
              formatNumber(
                sum((tool) => tool.displacement_bbl),
                2,
              ),
            ]}
          />
        )}
      </section>
      <section>
        <h3 className="px-2 pb-2 font-semibold text-lg">Bit</h3>
        {bits.isError ? (
          <ErrorLine
            message={bits.error.message}
            retry={() => bits.refetch()}
          />
        ) : (
          <RowTable
            rows={bits.data?.data ?? []}
            columns={BIT_COLUMNS}
            isLoading={bits.isPending}
            emptyMessage="No bit in this report yet. Use “New bit” to add it."
            renderActions={(row) => <BitActions bit={row} />}
          />
        )}
      </section>
    </div>
  );
}

export function BhaBitView() {
  return (
    <ReportSheetView
      title="BHA & bit"
      subject="drill string and bit"
      toolbar={(reportId) => <Toolbar reportId={reportId} />}
      sheet={(reportId) => <Sheet reportId={reportId} />}
    />
  );
}

import { pitTypeLabel } from "@/features/pits/labels";
import type { PitReading } from "../api";
import { formatAmount, totalsByPitType } from "../labels";

/** Volume and tonnage per pit type, as the summary under the rig's sheet shows. */
export function PitReadingsSummary({ readings }: { readings: PitReading[] }) {
  const totals = totalsByPitType(readings);
  const volume = totals.reduce((sum, total) => sum + total.volume, 0);
  const tonnage = totals.reduce((sum, total) => sum + total.tonnage, 0);

  return (
    <dl className="mt-4 grid grid-cols-[auto_auto_auto] justify-end gap-x-8 gap-y-1 px-2 text-sm">
      <dt className="font-medium">Pits</dt>
      <dd className="text-right font-medium">Volume (bbl)</dd>
      <dd className="text-right font-medium">Tonnage (MT)</dd>
      {totals.map((total) => (
        <SummaryRow
          key={total.type}
          label={pitTypeLabel(total.type)}
          volume={total.volume}
          tonnage={total.tonnage}
        />
      ))}
      <SummaryRow label="Total" volume={volume} tonnage={tonnage} bold />
    </dl>
  );
}

function SummaryRow({
  label,
  volume,
  tonnage,
  bold = false,
}: {
  label: string;
  volume: number;
  tonnage: number;
  bold?: boolean;
}) {
  const weight = bold ? "font-semibold" : undefined;
  return (
    <>
      <dt className={weight}>{label}</dt>
      <dd className={`text-right ${weight ?? ""}`}>{formatAmount(volume)}</dd>
      <dd className={`text-right ${weight ?? ""}`}>{formatAmount(tonnage)}</dd>
    </>
  );
}

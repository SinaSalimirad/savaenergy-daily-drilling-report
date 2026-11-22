import { computeRheology, type RheologyResults } from "./rheology.calc";
import type { RheologyReadingRow } from "./rheology.repository";

/**
 * The shape the web app receives, through Eden. The readings are stored; PV, YP, n and K are
 * computed by the server and `null` when the readings they need are missing.
 */
export type RheologyReadingDto = Omit<
  RheologyReadingRow,
  "created_at" | "updated_at" | "sample_time"
> &
  RheologyResults & {
    // "08:30", or `null` when the time is not known.
    sample_time: string | null;
    created_at: string;
    updated_at: string;
  };

export function toRheologyReadingDto(
  row: RheologyReadingRow,
): RheologyReadingDto {
  return {
    ...row,
    ...computeRheology(row),
    // The database keeps seconds ("08:30:00"); the sheet only has hours and minutes.
    sample_time: row.sample_time?.slice(0, 5) ?? null,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

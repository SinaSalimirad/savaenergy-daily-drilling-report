import {
  type BrineRow,
  computeSolidsAnalysis,
  type SolidsResults,
} from "./solids-analysis.calc";
import type { SolidsAnalysisRow } from "./solids-analysis.repository";

/**
 * The shape the web app receives, through Eden. The measurements are stored; the salt,
 * bentonite and gravity solids are computed by the server and `null` when the measurements
 * they need are missing.
 */
export type SolidsAnalysisDto = Omit<
  SolidsAnalysisRow,
  "created_at" | "updated_at" | "sample_time"
> &
  SolidsResults & {
    // "08:30", or `null` when the time is not known.
    sample_time: string | null;
    created_at: string;
    updated_at: string;
  };

export function toSolidsAnalysisDto(
  row: SolidsAnalysisRow,
  brine: BrineRow[],
): SolidsAnalysisDto {
  return {
    ...row,
    ...computeSolidsAnalysis(row, brine),
    // The database keeps seconds ("08:30:00"); the sheet only has hours and minutes.
    sample_time: row.sample_time?.slice(0, 5) ?? null,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

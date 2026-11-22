import type { StationResult } from "./survey.calc";
import type { SurveyStationRow } from "./survey.repository";

/**
 * The shape the web app receives, through Eden. The vertical depth, the position and the dogleg
 * are computed by the server from the whole survey (minimum curvature).
 */
export type SurveyStationDto = Omit<
  SurveyStationRow,
  "created_at" | "updated_at"
> &
  StationResult & { created_at: string; updated_at: string };

export function toSurveyStationDto(
  row: SurveyStationRow,
  result: StationResult,
): SurveyStationDto {
  return {
    ...row,
    ...result,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

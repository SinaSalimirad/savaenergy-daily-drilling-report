import type { MudSampleRow } from "./mud-sample.repository";

/** The shape the web app receives, through Eden. Every measurement is `null` when not taken. */
export type MudSampleDto = Omit<
  MudSampleRow,
  "created_at" | "updated_at" | "sample_time"
> & {
  // "08:30", or `null` when the time is not known.
  sample_time: string | null;
  created_at: string;
  updated_at: string;
};

export function toMudSampleDto(row: MudSampleRow): MudSampleDto {
  return {
    ...row,
    // The database keeps seconds ("08:30:00"); the sheet only has hours and minutes.
    sample_time: row.sample_time?.slice(0, 5) ?? null,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

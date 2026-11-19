import type { DailyReportRow } from "./daily-report.repository";

/**
 * The shape the web app receives. Dates are ISO strings because JSON has no Date type,
 * and the web app imports this type through Eden. Internal columns (`created_by`,
 * `updated_by`) stay on the server.
 */
export type DailyReportDto = {
  id: string;
  well_id: string;
  well_name: string;
  section_id: string;
  section_order: number;
  section_hole_size: number;
  report_no: number;
  report_date: string;
  bit_depth_m: number | null;
  bit_td_m: number | null;
  bit_tvd_m: number | null;
  created_at: string;
  updated_at: string;
};

export function toDailyReportDto(row: DailyReportRow): DailyReportDto {
  return {
    id: row.id,
    well_id: row.well_id,
    well_name: row.well_name,
    section_id: row.section_id,
    section_order: row.section_order,
    section_hole_size: row.section_hole_size,
    report_no: row.report_no,
    report_date: row.report_date,
    bit_depth_m: row.bit_depth_m,
    bit_td_m: row.bit_td_m,
    bit_tvd_m: row.bit_tvd_m,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

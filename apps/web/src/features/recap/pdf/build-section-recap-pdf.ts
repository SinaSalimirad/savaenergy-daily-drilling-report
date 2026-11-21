import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatHoleSize } from "schema";
import type { InventoryRow } from "@/features/inventory/api";
import { packageText } from "@/features/project-products/labels";
import type { DailyReport } from "@/features/reports/api";

const EMPTY_VALUE = "—";
const PAGE_MARGIN = 40;
const HEAD_FILL: [number, number, number] = [241, 245, 249];
const HEAD_TEXT: [number, number, number] = [15, 23, 42];

export type SectionRecapPdfInput = {
  report: DailyReport;
  usedRows: InventoryRow[];
  allRows: InventoryRow[];
};

function money(value: number | null): string {
  return value === null ? EMPTY_VALUE : value.toLocaleString("en-US");
}

function reportHeading(report: DailyReport): string {
  const section = `${report.section_order} · ${formatHoleSize(report.section_hole_size)}`;
  return `Well: ${report.well_name}    Section: ${section}    Report: #${report.report_no}    Date: ${report.report_date}`;
}

/** Builds the Section recap PDF: the products used that day, then the full inventory sheet. */
export function buildSectionRecapPdf({
  report,
  usedRows,
  allRows,
}: SectionRecapPdfInput): jsPDF {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  doc.setFontSize(14);
  doc.text("Section recap", PAGE_MARGIN, 40);
  doc.setFontSize(8);
  doc.text(reportHeading(report), PAGE_MARGIN, 58);

  doc.setFontSize(11);
  doc.text("Products used — last 24 hrs", PAGE_MARGIN, 82);

  autoTable(doc, {
    startY: 90,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    styles: { fontSize: 9 },
    headStyles: { fillColor: HEAD_FILL, textColor: HEAD_TEXT },
    head: [["No.", "Product name", "Package", "Used", "Final", "Cost"]],
    body: usedRows.map((row, index) => [
      index + 1,
      row.product.name,
      packageText(row.product) ?? EMPTY_VALUE,
      row.daily_used,
      row.final_stock,
      money(row.daily_cost),
    ]),
  });

  // The inventory sheet has 15 columns: a dedicated landscape page gives it the width to
  // stay on one page, instead of portrait forcing the table to spill onto a second page.
  doc.addPage("a4", "landscape");
  doc.setFontSize(11);
  doc.text("Wellsite chemical inventory", PAGE_MARGIN, 40);
  doc.setFontSize(8);
  doc.text(reportHeading(report), PAGE_MARGIN, 58);

  autoTable(doc, {
    startY: 70,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    styles: { fontSize: 9, halign: "center" },
    headStyles: { fillColor: HEAD_FILL, textColor: HEAD_TEXT },
    // Product name is the only left-aligned column, same as the on-screen table.
    columnStyles: { 1: { halign: "left" } },
    // Two header rows, grouping Daily/Monthly/Cumulative over their Rec./Used/Return columns,
    // the same layout as the Inventory page's table.
    head: [
      [
        { content: "No.", rowSpan: 2 },
        { content: "Product", rowSpan: 2 },
        { content: "Package", rowSpan: 2 },
        { content: "Unit price", rowSpan: 2 },
        { content: "Initial stock", rowSpan: 2 },
        { content: "Daily", colSpan: 2 },
        { content: "Section used", rowSpan: 2 },
        { content: "Monthly", colSpan: 2 },
        { content: "Cumulative", colSpan: 3 },
        { content: "Final stock", rowSpan: 2 },
        { content: "Daily cost", rowSpan: 2 },
      ],
      ["Rec.", "Used", "Rec.", "Used", "Rec.", "Used", "Return"],
    ],
    body: allRows.map((row, index) => [
      index + 1,
      row.product.name,
      packageText(row.product) ?? EMPTY_VALUE,
      money(row.unit_price),
      row.initial_stock,
      row.daily_received,
      row.daily_used,
      row.section_used,
      row.monthly_received,
      row.monthly_used,
      row.cumulative_received,
      row.cumulative_used,
      row.cumulative_returned,
      row.final_stock,
      money(row.daily_cost),
    ]),
  });

  return doc;
}

// `well name` and `report number` make a stable, readable file name across reports.
function pdfFileName(report: DailyReport): string {
  return `section-recap-${report.well_name}-report-${report.report_no}.pdf`
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-");
}

/** Builds the PDF and triggers the browser's download of it. */
export function downloadSectionRecapPdf(input: SectionRecapPdfInput): void {
  const doc = buildSectionRecapPdf(input);
  doc.save(pdfFileName(input.report));
}

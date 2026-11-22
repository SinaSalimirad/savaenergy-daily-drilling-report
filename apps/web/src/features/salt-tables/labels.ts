import type { SaltType } from "schema";

// The sheet names the ion of each salt in its own column header.
const CATION_LABELS: Record<SaltType, string> = {
  KCl: "K+",
  NaCl: "Na+",
  CaCl2: "Ca2+",
};

export const cationLabel = (saltType: SaltType) => CATION_LABELS[saltType];

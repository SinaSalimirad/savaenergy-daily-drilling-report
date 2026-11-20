// The numbers of the inventory sheet. They are computed here, never stored, so they cannot
// disagree with the movements. Everything is per well: a product moves in and out of one rig.

/** One day of one product, as stored in `product_inventory`. */
export type Movement = {
  projectProductId: string;
  reportDate: string; // YYYY-MM-DD
  sectionId: string;
  received: number;
  used: number;
  returned: number;
};

export type Totals = {
  section_used: number;
  monthly_received: number;
  monthly_used: number;
  cumulative_received: number;
  cumulative_used: number;
  cumulative_returned: number;
};

const sum = (movements: Movement[], pick: (m: Movement) => number) =>
  movements.reduce((total, movement) => total + pick(movement), 0);

/**
 * Totals of one product up to the report being shown. `history` holds the movements of the
 * well, so it is filtered here: only this product, and only days up to and including `date`.
 */
export function totalsFor(
  history: Movement[],
  target: { projectProductId: string; reportDate: string; sectionId: string },
): Totals {
  const upToToday = history.filter(
    (m) =>
      m.projectProductId === target.projectProductId &&
      m.reportDate <= target.reportDate,
  );
  // "2026-03-14" and "2026-03-01" share the month "2026-03".
  const month = target.reportDate.slice(0, 7);
  const thisMonth = upToToday.filter((m) => m.reportDate.startsWith(month));
  const thisSection = upToToday.filter((m) => m.sectionId === target.sectionId);

  return {
    section_used: sum(thisSection, (m) => m.used),
    monthly_received: sum(thisMonth, (m) => m.received),
    monthly_used: sum(thisMonth, (m) => m.used),
    cumulative_received: sum(upToToday, (m) => m.received),
    cumulative_used: sum(upToToday, (m) => m.used),
    cumulative_returned: sum(upToToday, (m) => m.returned),
  };
}

export const finalStock = (m: {
  initial: number;
  received: number;
  used: number;
  returned: number;
}) => m.initial + m.received - m.used - m.returned;

type CostInput = {
  price: number | null;
  kind: "bulk" | "dimensional" | "equipment";
  length_m: number | null;
  width_m: number | null;
  used: number;
  final_stock: number;
};

/**
 * The cost of one day. The price is per package for bulk products and per m² for dimensional
 * ones (a used item is length x width m²). Equipment is paid per day for each unit on site.
 * `null` while the project has no price for the product.
 */
export function dailyCost(input: CostInput): number | null {
  if (input.price === null) return null;
  let cost: number;
  switch (input.kind) {
    case "bulk":
      cost = input.used * input.price;
      break;
    case "dimensional":
      cost =
        input.used * (input.length_m ?? 0) * (input.width_m ?? 0) * input.price;
      break;
    case "equipment":
      cost = input.final_stock * input.price;
      break;
  }
  // Money has at most 2 decimals; this also hides float noise such as 0.1 * 3.
  return Math.round(cost * 100) / 100;
}

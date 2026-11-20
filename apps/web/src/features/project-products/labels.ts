import { PROJECT_PRODUCT_ORIGINS } from "schema";
import type { SelectOption } from "@/components/ui/select";
import type { Product } from "@/features/products/api";
import { packageUnitLabel } from "@/features/products/labels";

const ORIGIN_LABELS: Record<(typeof PROJECT_PRODUCT_ORIGINS)[number], string> =
  { foreign: "Foreign", local: "Local" };

export const projectProductOriginLabel = (origin: keyof typeof ORIGIN_LABELS) =>
  ORIGIN_LABELS[origin];

export const ORIGIN_OPTIONS: SelectOption[] = PROJECT_PRODUCT_ORIGINS.map(
  (origin) => ({ value: origin, label: ORIGIN_LABELS[origin] }),
);

/** How a product is packaged, as the inventory sheet writes it: "25 kg", "10*10 m", or none. */
export function packageText(
  product: Pick<
    Product,
    "kind" | "package_size" | "package_unit" | "length_m" | "width_m"
  >,
): string | null {
  if (product.kind === "bulk" && product.package_unit) {
    return `${product.package_size} ${packageUnitLabel(product.package_unit)}`;
  }
  if (product.kind === "dimensional") {
    return `${product.length_m}*${product.width_m} m`;
  }
  return null;
}

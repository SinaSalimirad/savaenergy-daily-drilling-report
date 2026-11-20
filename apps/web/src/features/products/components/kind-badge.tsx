import { cn } from "cn";
import type { ProductKind } from "schema";
import { productKindLabel } from "../labels";

// One colour per kind. They differ from the status colours on purpose, so a kind is never read
// as a status when both appear in one page.
const KIND_STYLES: Record<ProductKind, string> = {
  bulk: "bg-teal-100 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300",
  dimensional:
    "bg-pink-100 text-pink-800 dark:bg-pink-400/15 dark:text-pink-300",
  equipment:
    "bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300",
};

/** The kind of a product as a coloured pill. */
export function KindBadge({ kind }: { kind: ProductKind }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs",
        KIND_STYLES[kind],
      )}
    >
      {productKindLabel(kind)}
    </span>
  );
}

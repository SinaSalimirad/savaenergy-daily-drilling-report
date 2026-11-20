import { type ProductDto, toProductDto } from "../products/product.mapper";
import { dailyCost, finalStock, type Totals } from "./inventory.calc";
import type { InventoryRowData } from "./inventory.repository";

/**
 * One line of the inventory sheet, as the web app receives it (through Eden).
 * Every number except the four stored ones is computed by the server.
 */
export type InventoryDto = Totals & {
  id: string;
  report_id: string;
  project_product_id: string;
  product: ProductDto;
  origin: InventoryRowData["link"]["origin"];
  unit_price: number | null; // in the project's currency
  initial_stock: number;
  daily_received: number;
  daily_used: number;
  daily_returned: number;
  final_stock: number;
  daily_cost: number | null;
};

export function toInventoryDto(
  { inventory, link, product }: InventoryRowData,
  totals: Totals,
): InventoryDto {
  const final = finalStock(inventory);
  return {
    id: inventory.id,
    report_id: inventory.report_id,
    project_product_id: inventory.project_product_id,
    product: toProductDto(product),
    origin: link.origin,
    unit_price: link.price,
    initial_stock: inventory.initial,
    daily_received: inventory.received,
    daily_used: inventory.used,
    daily_returned: inventory.returned,
    ...totals,
    final_stock: final,
    daily_cost: dailyCost({
      price: link.price,
      kind: product.kind,
      length_m: product.length_m,
      width_m: product.width_m,
      used: inventory.used,
      final_stock: final,
    }),
  };
}

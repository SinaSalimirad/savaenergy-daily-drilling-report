import type { ProductRow } from "./product.repository";

/**
 * The shape the web app receives. Dates are ISO strings because JSON has no Date type,
 * and the web app imports this type through Eden.
 */
export type ProductDto = {
  id: string;
  name: string;
  kind: ProductRow["kind"];
  package_size: number | null;
  package_unit: ProductRow["package_unit"];
  specific_gravity: number | null;
  length_m: number | null;
  width_m: number | null;
  created_at: string;
  updated_at: string;
};

export function toProductDto(row: ProductRow): ProductDto {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    package_size: row.package_size,
    package_unit: row.package_unit,
    specific_gravity: row.specific_gravity,
    length_m: row.length_m,
    width_m: row.width_m,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

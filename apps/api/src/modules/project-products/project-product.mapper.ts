import { type ProductDto, toProductDto } from "../products/product.mapper";
import type { ProjectProductRow } from "./project-product.repository";

/**
 * The shape the web app receives. Dates are ISO strings because JSON has no Date type,
 * and the web app imports this type through Eden. Internal columns (`created_by`,
 * `updated_by`) stay on the server.
 */
export type ProjectProductDto = {
  id: string;
  project_id: string;
  product_id: string;
  origin: ProjectProductRow["project_product"]["origin"];
  price: number | null;
  product: ProductDto;
  created_at: string;
  updated_at: string;
};

export function toProjectProductDto(row: ProjectProductRow): ProjectProductDto {
  const { project_product: link, product } = row;
  return {
    id: link.id,
    project_id: link.project_id,
    product_id: link.product_id,
    origin: link.origin,
    price: link.price,
    product: toProductDto(product),
    created_at: link.created_at.toISOString(),
    updated_at: link.updated_at.toISOString(),
  };
}

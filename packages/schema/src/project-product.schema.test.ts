import { describe, expect, test } from "bun:test";
import {
  projectProductCreateSchema,
  projectProductUpdateSchema,
} from "./project-product.schema";

const ID = "00000000-0000-4000-8000-000000000001";
const base = { project_id: ID, product_id: ID, origin: "local" };

describe("projectProductCreateSchema", () => {
  test("the price is optional and may be null", () => {
    expect(projectProductCreateSchema.safeParse(base).success).toBe(true);
    expect(
      projectProductCreateSchema.safeParse({ ...base, price: null }).success,
    ).toBe(true);
  });

  test("accepts both origins and rejects others", () => {
    for (const origin of ["local", "foreign"]) {
      expect(
        projectProductCreateSchema.safeParse({ ...base, origin }).success,
      ).toBe(true);
    }
    expect(
      projectProductCreateSchema.safeParse({ ...base, origin: "mars" }).success,
    ).toBe(false);
  });

  test.each([
    ["zero", 0],
    ["negative", -5],
    ["too large", 1_000_000_000],
    ["more than 5 decimals", 1.123456],
  ])("rejects a price that is %s", (_label, price) => {
    expect(
      projectProductCreateSchema.safeParse({ ...base, price }).success,
    ).toBe(false);
  });

  test("accepts a price with 5 decimals", () => {
    expect(
      projectProductCreateSchema.safeParse({ ...base, price: 12.12345 })
        .success,
    ).toBe(true);
  });
});

describe("projectProductUpdateSchema", () => {
  test("accepts the origin, the price, or both", () => {
    expect(
      projectProductUpdateSchema.safeParse({ origin: "foreign" }).success,
    ).toBe(true);
    expect(projectProductUpdateSchema.safeParse({ price: null }).success).toBe(
      true,
    );
    expect(
      projectProductUpdateSchema.safeParse({ origin: "local", price: 3 })
        .success,
    ).toBe(true);
  });

  test("rejects an empty patch and a bad price", () => {
    expect(projectProductUpdateSchema.safeParse({}).success).toBe(false);
    expect(projectProductUpdateSchema.safeParse({ price: 0 }).success).toBe(
      false,
    );
  });

  test("the project and the product cannot be changed", () => {
    const parsed = projectProductUpdateSchema.safeParse({
      origin: "local",
      project_id: ID,
    });

    expect(parsed.success && "project_id" in parsed.data).toBe(false);
  });
});

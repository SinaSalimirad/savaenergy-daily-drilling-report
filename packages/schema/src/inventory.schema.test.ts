import { describe, expect, test } from "bun:test";
import {
  inventoryCreateSchema,
  inventoryUpdateSchema,
} from "./inventory.schema";

const ID = "00000000-0000-4000-8000-000000000001";
const base = { report_id: ID, project_product_id: ID };

describe("inventoryCreateSchema", () => {
  test("only the report and the product are required", () => {
    expect(inventoryCreateSchema.safeParse(base).success).toBe(true);
  });

  test("accepts whole numbers for the four quantities, zero included", () => {
    const parsed = inventoryCreateSchema.safeParse({
      ...base,
      initial: 0,
      received: 5,
      used: 3,
      returned: 1,
    });

    expect(parsed.success).toBe(true);
  });

  test.each([
    ["negative", -1],
    ["fractional", 1.5],
    ["too large", 1_000_001],
    ["not a number", "4"],
    ["null", null],
  ])("rejects a %s quantity", (_label, value) => {
    expect(
      inventoryCreateSchema.safeParse({ ...base, used: value }).success,
    ).toBe(false);
  });

  test("rejects ids that are not uuids", () => {
    expect(
      inventoryCreateSchema.safeParse({ ...base, report_id: "abc" }).success,
    ).toBe(false);
  });
});

describe("inventoryUpdateSchema", () => {
  test("accepts one field", () => {
    expect(inventoryUpdateSchema.safeParse({ used: 2 }).success).toBe(true);
  });

  test("rejects an empty patch", () => {
    expect(inventoryUpdateSchema.safeParse({}).success).toBe(false);
  });

  test("cannot move a row to another report or product", () => {
    const parsed = inventoryUpdateSchema.safeParse({ used: 1, report_id: ID });

    // Unknown keys are dropped, so the patch never carries them to the database.
    expect(parsed.success && "report_id" in parsed.data).toBe(false);
  });
});

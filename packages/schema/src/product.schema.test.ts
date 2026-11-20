import { describe, expect, test } from "bun:test";
import { productInputSchema } from "./product.schema";

const bulk = {
  kind: "bulk",
  name: "Barite",
  package_size: 25,
  package_unit: "kg",
  specific_gravity: 4.2,
};
const dimensional = {
  kind: "dimensional",
  name: "Tarpaulin",
  length_m: 10,
  width_m: 5,
};
const equipment = { kind: "equipment", name: "Mud Skid" };

describe("productInputSchema", () => {
  test("accepts a valid product of each kind", () => {
    for (const product of [bulk, dimensional, equipment]) {
      expect(productInputSchema.safeParse(product).success).toBe(true);
    }
  });

  test("trims the name and rejects an empty or very long one", () => {
    const trimmed = productInputSchema.safeParse({
      ...equipment,
      name: "  Skid  ",
    });

    expect(trimmed.success && trimmed.data.name).toBe("Skid");
    expect(
      productInputSchema.safeParse({ ...equipment, name: "  " }).success,
    ).toBe(false);
    expect(
      productInputSchema.safeParse({ ...equipment, name: "x".repeat(201) })
        .success,
    ).toBe(false);
  });

  test("a bulk product needs a size, a unit and a gravity", () => {
    for (const missing of [
      "package_size",
      "package_unit",
      "specific_gravity",
    ]) {
      const { [missing as keyof typeof bulk]: _, ...rest } = bulk;
      expect(productInputSchema.safeParse(rest).success).toBe(false);
    }
  });

  test("a dimensional product needs a length and a width", () => {
    expect(
      productInputSchema.safeParse({
        kind: "dimensional",
        name: "T",
        length_m: 10,
      }).success,
    ).toBe(false);
    expect(
      productInputSchema.safeParse({
        kind: "dimensional",
        name: "T",
        width_m: 10,
      }).success,
    ).toBe(false);
  });

  test.each([
    ["package size of 0", { package_size: 0 }],
    ["package size of 100", { package_size: 100 }],
    ["more than 3 decimals", { specific_gravity: 1.2345 }],
    ["an unknown unit", { package_unit: "stone" }],
  ])("rejects a bulk product with %s", (_label, change) => {
    expect(productInputSchema.safeParse({ ...bulk, ...change }).success).toBe(
      false,
    );
  });

  test("drops the fields of another kind", () => {
    const parsed = productInputSchema.safeParse({
      ...equipment,
      package_size: 25,
      length_m: 3,
    });

    expect(parsed.success && Object.keys(parsed.data).sort()).toEqual([
      "kind",
      "name",
    ]);
  });

  test("rejects an unknown kind", () => {
    expect(
      productInputSchema.safeParse({ kind: "liquid", name: "Water" }).success,
    ).toBe(false);
  });
});

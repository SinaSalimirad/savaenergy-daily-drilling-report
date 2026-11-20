import { describe, expect, test } from "bun:test";
import {
  galPerStroke,
  pumpCreateSchema,
  pumpUpdateSchema,
} from "./pump.schema";

const PROJECT_ID = "00000000-0000-4000-8000-000000000000";

const valid = {
  project_id: PROJECT_ID,
  model: "FH 1500",
  type: "triplex",
  liner_diameter: 6,
  stroke_length: 12,
  efficiency: 95,
};

describe("galPerStroke", () => {
  // The three rows of the rig's sheet.
  test.each([
    { liner_diameter: 6, expected: 4.19 },
    { liner_diameter: 6.5, expected: 4.91 },
  ])("a triplex with a $liner_diameter liner gives $expected", (row) => {
    const result = galPerStroke({
      type: "triplex",
      liner_diameter: row.liner_diameter,
      stroke_length: 12,
      efficiency: 95,
    });

    expect(result).toBeCloseTo(row.expected, 2);
  });

  test("a lower efficiency lowers the output in proportion", () => {
    const full = galPerStroke({ ...valid, type: "triplex", efficiency: 100 });
    const half = galPerStroke({ ...valid, type: "triplex", efficiency: 50 });

    expect(half).toBeCloseTo((full ?? 0) / 2, 10);
  });

  test("a duplex has no output yet, because the rod size is unknown", () => {
    expect(galPerStroke({ ...valid, type: "duplex" })).toBeNull();
  });
});

describe("pumpCreateSchema", () => {
  test("accepts a pump without an order", () => {
    expect(pumpCreateSchema.safeParse(valid).success).toBe(true);
  });

  test("accepts an efficiency with two decimals", () => {
    expect(
      pumpCreateSchema.safeParse({ ...valid, efficiency: 97.5 }).success,
    ).toBe(true);
  });

  test("trims the model", () => {
    const result = pumpCreateSchema.parse({ ...valid, model: "  FH 1500 " });

    expect(result.model).toBe("FH 1500");
  });

  test.each([
    { model: "   " },
    { type: "quintuplex" },
    { liner_diameter: 0 },
    { liner_diameter: 6.1234 },
    { liner_diameter: "6" },
    { stroke_length: -1 },
    { efficiency: 0 },
    { efficiency: 100.5 },
    { efficiency: 95.123 },
    { order: 0 },
    { order: 1.5 },
    { project_id: "not-a-uuid" },
  ])("rejects %o", (bad) => {
    expect(pumpCreateSchema.safeParse({ ...valid, ...bad }).success).toBe(
      false,
    );
  });
});

describe("pumpUpdateSchema", () => {
  test("accepts one field", () => {
    expect(pumpUpdateSchema.safeParse({ efficiency: 90 }).success).toBe(true);
  });

  test("rejects an empty patch", () => {
    expect(pumpUpdateSchema.safeParse({}).success).toBe(false);
  });
});

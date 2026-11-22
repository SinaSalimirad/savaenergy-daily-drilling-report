import { describe, expect, test } from "bun:test";
import { pitCreateSchema, pitUpdateSchema } from "./pit.schema";

const valid = {
  project_id: "00000000-0000-4000-8000-000000000000",
  name: "Pit 1",
  type: "active",
};

describe("pitCreateSchema", () => {
  test("accepts a pit without an order or a capacity", () => {
    expect(pitCreateSchema.safeParse(valid).success).toBe(true);
  });

  test.each(["active", "reserve", "not mud"])("accepts the type %s", (type) => {
    expect(pitCreateSchema.safeParse({ ...valid, type }).success).toBe(true);
  });

  test("accepts a capacity with two decimals, or null", () => {
    expect(
      pitCreateSchema.safeParse({ ...valid, capacity: 250.55 }).success,
    ).toBe(true);
    expect(
      pitCreateSchema.safeParse({ ...valid, capacity: null }).success,
    ).toBe(true);
  });

  test.each([
    { name: "  " },
    { type: "tank" },
    { capacity: 0 },
    { capacity: -1 },
    { capacity: 1.234 },
    { capacity: 1_000_000 },
    { order: 0 },
    { order: 1.5 },
  ])("rejects %o", (bad) => {
    expect(pitCreateSchema.safeParse({ ...valid, ...bad }).success).toBe(false);
  });
});

describe("pitUpdateSchema", () => {
  test("accepts one field", () => {
    expect(pitUpdateSchema.safeParse({ capacity: null }).success).toBe(true);
  });

  test("rejects an empty patch", () => {
    expect(pitUpdateSchema.safeParse({}).success).toBe(false);
  });
});

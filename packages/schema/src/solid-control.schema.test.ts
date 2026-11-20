import { describe, expect, test } from "bun:test";
import { sceCreateSchema, sceUpdateSchema } from "./solid-control.schema";

const PROJECT_ID = "00000000-0000-4000-8000-000000000000";
const valid = { project_id: PROJECT_ID, type: "shale_shaker" };

describe("sceCreateSchema", () => {
  test("accepts a unit with only a project and a type", () => {
    expect(sceCreateSchema.safeParse(valid).success).toBe(true);
  });

  test("accepts a full row of the sheet", () => {
    const result = sceCreateSchema.safeParse({
      ...valid,
      order: 1,
      unit_no: 2,
      manufacturer: "Swaco",
      model: "Mongoose",
      screen_size: "170/170/170/170",
    });

    expect(result.success).toBe(true);
  });

  test("trims the text fields and accepts null", () => {
    const result = sceCreateSchema.parse({
      ...valid,
      manufacturer: "  Swaco ",
      model: null,
    });

    expect(result.manufacturer).toBe("Swaco");
    expect(result.model).toBeNull();
  });

  test.each([
    { type: "shaker" },
    { order: 0 },
    { order: 1.5 },
    { unit_no: 0 },
    { unit_no: 100 },
    { manufacturer: "   " },
    { screen_size: "x".repeat(101) },
    { project_id: "not-a-uuid" },
  ])("rejects %o", (bad) => {
    expect(sceCreateSchema.safeParse({ ...valid, ...bad }).success).toBe(false);
  });
});

describe("sceUpdateSchema", () => {
  test("accepts one field, and null to clear one", () => {
    expect(sceUpdateSchema.safeParse({ model: "X" }).success).toBe(true);
    expect(sceUpdateSchema.safeParse({ screen_size: null }).success).toBe(true);
  });

  test("rejects an empty patch", () => {
    expect(sceUpdateSchema.safeParse({}).success).toBe(false);
  });
});

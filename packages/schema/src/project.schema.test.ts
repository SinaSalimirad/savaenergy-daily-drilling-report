import { describe, expect, it } from "bun:test";
import {
  projectCreateSchema,
  projectStatusSchema,
  projectUpdateSchema,
} from "./project.schema";

const validProject = {
  name: "South Pars Phase 14",
  operator: "Shell",
  contractor: "Halliburton",
  field: "South Pars",
  wells: 12,
  currency: "USD",
};

describe("projectCreateSchema", () => {
  it("accepts a complete project", () => {
    expect(projectCreateSchema.safeParse(validProject).success).toBe(true);
  });

  it("trims text fields", () => {
    const result = projectCreateSchema.parse({
      ...validProject,
      name: "  South Pars  ",
    });

    expect(result.name).toBe("South Pars");
  });

  it.each([0, -1, 1.5, "12"])("rejects %p as the number of wells", (wells) => {
    expect(
      projectCreateSchema.safeParse({ ...validProject, wells }).success,
    ).toBe(false);
  });

  it("rejects a missing number of wells", () => {
    const { wells: _wells, ...withoutWells } = validProject;

    expect(projectCreateSchema.safeParse(withoutWells).success).toBe(false);
  });

  it("ignores a status sent by a client, because the API derives it", () => {
    const result = projectCreateSchema.parse({
      ...validProject,
      status: "archived",
    });

    expect("status" in result).toBe(false);
  });
});

describe("projectUpdateSchema", () => {
  it("accepts a patch with only the number of wells", () => {
    expect(projectUpdateSchema.safeParse({ wells: 3 }).success).toBe(true);
  });

  it("rejects an empty patch", () => {
    expect(projectUpdateSchema.safeParse({}).success).toBe(false);
  });
});

describe("projectStatusSchema", () => {
  it("knows the three derived statuses", () => {
    expect(projectStatusSchema.options).toEqual([
      "active",
      "inactive",
      "archived",
    ]);
  });
});

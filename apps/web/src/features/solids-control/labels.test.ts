import { describe, expect, it } from "bun:test";
import { SCE_TYPES } from "schema";
import { SCE_TYPE_OPTIONS, sceTypeLabel } from "./labels";

describe("solid control labels", () => {
  it("names a type", () => {
    expect(sceTypeLabel("shale_shaker")).toBe("Shale shaker");
  });

  it("offers every type in a select, in the order of the list", () => {
    expect(SCE_TYPE_OPTIONS.map((option) => option.value)).toEqual([
      ...SCE_TYPES,
    ]);
  });
});

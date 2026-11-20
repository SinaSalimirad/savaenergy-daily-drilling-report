import { describe, expect, it } from "bun:test";
import { formatTwoDecimals, PUMP_TYPE_OPTIONS, pumpTypeLabel } from "./labels";

describe("pump labels", () => {
  it("names each pump type", () => {
    expect(pumpTypeLabel("triplex")).toBe("Triplex");
    expect(pumpTypeLabel("duplex")).toBe("Duplex");
  });

  it("offers every pump type in a select", () => {
    expect(PUMP_TYPE_OPTIONS.map((option) => option.value)).toEqual([
      "triplex",
      "duplex",
    ]);
  });

  it("shows two decimals", () => {
    expect(formatTwoDecimals(6)).toBe("6.00");
    expect(formatTwoDecimals(4.1861)).toBe("4.19");
  });
});

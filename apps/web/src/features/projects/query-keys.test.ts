import { describe, expect, it } from "bun:test";
import { projectKeys } from "./query-keys";

describe("projectKeys", () => {
  it("starts every list key with the `all` key, so invalidating `all` refreshes every list", () => {
    const listKey = projectKeys.list({ page: 2, pageSize: 10, archived: true });

    expect(listKey.slice(0, projectKeys.all.length)).toEqual([
      ...projectKeys.all,
    ]);
  });

  it("gives different keys to the active and the archived list", () => {
    const active = projectKeys.list({ page: 1, pageSize: 10, archived: false });
    const archived = projectKeys.list({
      page: 1,
      pageSize: 10,
      archived: true,
    });

    expect(active).not.toEqual(archived);
  });

  it("gives different keys to different pages", () => {
    const first = projectKeys.list({ page: 1, pageSize: 10, archived: false });
    const second = projectKeys.list({ page: 2, pageSize: 10, archived: false });

    expect(first).not.toEqual(second);
  });
});

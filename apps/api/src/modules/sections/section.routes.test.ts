import { beforeEach, describe, expect, test } from "bun:test";
import {
  call,
  createProject,
  createSection,
  createWell,
  MISSING_ID,
  resetDb,
  sectionPayload,
} from "../../test/helpers";

let wellId: string;

beforeEach(async () => {
  await resetDb();
  const project = await createProject({ name: "Alpha" });
  wellId = (await createWell(project.id, { name: "A-1" })).id;
});

describe("POST /sections", () => {
  test("creates a section and returns the well name with it", async () => {
    const { status, body } = await call(
      "POST",
      "/sections",
      sectionPayload(wellId, {
        order: 2,
        hole_size: 8.5,
        hole_type: "open_hole",
      }),
    );

    expect(status).toBe(201);
    expect(body.data).toMatchObject({
      well_id: wellId,
      well_name: "A-1",
      project_name: "Alpha",
      order: 2,
      hole_size: 8.5,
      hole_type: "open_hole",
    });
    expect(body.data).not.toHaveProperty("created_by");
  });

  test("a hole type is optional", async () => {
    const { body } = await call("POST", "/sections", sectionPayload(wellId));

    expect(body.data.hole_type).toBeNull();
  });

  test("without an order, the section goes after the last one", async () => {
    const first = await createSection(wellId);
    const second = await createSection(wellId);
    await createSection(wellId, { order: 10 });
    const last = await createSection(wellId);

    expect([first.order, second.order, last.order]).toEqual([1, 2, 11]);
  });

  test("numbers the sections of each well on their own", async () => {
    const project = await createProject({ name: "Beta" });
    const other = await createWell(project.id, { name: "B-1" });
    await createSection(wellId);
    await createSection(wellId);

    const section = await createSection(other.id);

    expect(section.order).toBe(1);
  });

  test("rejects an order that the well already uses with 409", async () => {
    await createSection(wellId, { order: 1 });

    const { status, body } = await call(
      "POST",
      "/sections",
      sectionPayload(wellId, { order: 1 }),
    );

    expect(status).toBe(409);
    expect(body.code).toBe("SECTION_ORDER_TAKEN");
  });

  test("allows the same order in another well", async () => {
    const project = await createProject({ name: "Beta" });
    const other = await createWell(project.id, { name: "B-1" });
    await createSection(wellId, { order: 1 });

    const { status } = await call(
      "POST",
      "/sections",
      sectionPayload(other.id, { order: 1 }),
    );

    expect(status).toBe(201);
  });

  test("returns 404 when the well does not exist", async () => {
    const { status, body } = await call(
      "POST",
      "/sections",
      sectionPayload(MISSING_ID),
    );

    expect(status).toBe(404);
    expect(body.message).toBe("Well was not found.");
  });

  test.each([
    { hole_size: 18.5 },
    { hole_size: "12.25" },
    { hole_type: "tubing" },
    { order: 0 },
    { order: 1.5 },
    { well_id: "not-a-uuid" },
  ])("rejects %o with 422", async (bad) => {
    const { status, body } = await call(
      "POST",
      "/sections",
      sectionPayload(wellId, bad),
    );

    expect(status).toBe(422);
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  test("rejects a missing hole size with 422", async () => {
    const { status } = await call("POST", "/sections", { well_id: wellId });

    expect(status).toBe(422);
  });
});

describe("GET /sections", () => {
  test("returns an empty page when there are no sections", async () => {
    const { status, body } = await call("GET", "/sections");

    expect(status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.meta).toEqual({ page: 1, pageSize: 20, total: 0 });
  });

  test("lists the sections of a well in their order", async () => {
    await createSection(wellId, { order: 3 });
    await createSection(wellId, { order: 1 });
    await createSection(wellId, { order: 2 });

    const { body } = await call("GET", "/sections");

    expect(body.data.map((s: { order: number }) => s.order)).toEqual([1, 2, 3]);
  });

  test("groups the sections by well name", async () => {
    const project = await createProject({ name: "Beta" });
    const other = await createWell(project.id, { name: "A-0" });
    await createSection(wellId, { order: 1 });
    await createSection(other.id, { order: 1 });

    const { body } = await call("GET", "/sections");

    expect(body.data.map((s: { well_name: string }) => s.well_name)).toEqual([
      "A-0",
      "A-1",
    ]);
  });

  test("filters by well", async () => {
    const project = await createProject({ name: "Beta" });
    const other = await createWell(project.id, { name: "B-1" });
    await createSection(wellId);
    const wanted = await createSection(other.id);

    const { body } = await call("GET", `/sections?well_id=${other.id}`);

    expect(body.data.map((s: { id: string }) => s.id)).toEqual([wanted.id]);
    expect(body.meta.total).toBe(1);
  });

  test("filters by project and counts only that project's sections", async () => {
    const project = await createProject({ name: "Beta" });
    const other = await createWell(project.id, { name: "B-1" });
    await createSection(wellId);
    const wanted = await createSection(other.id);

    const { body } = await call("GET", `/sections?project_id=${project.id}`);

    expect(body.data.map((s: { id: string }) => s.id)).toEqual([wanted.id]);
    expect(body.meta.total).toBe(1);
  });

  test("returns nothing when the well is not in the requested project", async () => {
    const project = await createProject({ name: "Beta" });
    await createSection(wellId);

    const { status, body } = await call(
      "GET",
      `/sections?project_id=${project.id}&well_id=${wellId}`,
    );

    expect(status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.meta.total).toBe(0);
  });

  test("rejects a project id that is not a uuid with 422", async () => {
    const { status } = await call("GET", "/sections?project_id=nope");

    expect(status).toBe(422);
  });

  test("pages the results and reports the total", async () => {
    for (let i = 0; i < 3; i++) await createSection(wellId);

    const second = await call("GET", "/sections?page=2&pageSize=2");

    expect(second.body.data).toHaveLength(1);
    expect(second.body.meta).toEqual({ page: 2, pageSize: 2, total: 3 });
  });

  test.each(["page=0", "pageSize=101", "well_id=nope"])(
    "rejects the query %s with 422",
    async (query) => {
      const { status } = await call("GET", `/sections?${query}`);

      expect(status).toBe(422);
    },
  );
});

describe("GET /sections/:id", () => {
  test("returns the section", async () => {
    const section = await createSection(wellId);

    const { status, body } = await call("GET", `/sections/${section.id}`);

    expect(status).toBe(200);
    expect(body.data).toEqual(section);
  });

  test("returns 404 for an unknown id", async () => {
    const { status, body } = await call("GET", `/sections/${MISSING_ID}`);

    expect(status).toBe(404);
    expect(body.code).toBe("NOT_FOUND");
  });

  test("returns 422 for an id that is not a uuid", async () => {
    const { status } = await call("GET", "/sections/not-a-uuid");

    expect(status).toBe(422);
  });
});

describe("PATCH /sections/:id", () => {
  test("changes only the sent fields", async () => {
    const section = await createSection(wellId, { hole_size: 12.25 });

    const { status, body } = await call("PATCH", `/sections/${section.id}`, {
      hole_size: 8.5,
    });

    expect(status).toBe(200);
    expect(body.data).toMatchObject({
      hole_size: 8.5,
      order: section.order,
    });
  });

  test("clears the hole type when it is sent as null", async () => {
    const section = await createSection(wellId, { hole_type: "casing" });

    const { body } = await call("PATCH", `/sections/${section.id}`, {
      hole_type: null,
    });

    expect(body.data.hole_type).toBeNull();
  });

  test("rejects an order that another section of the well uses with 409", async () => {
    await createSection(wellId, { order: 1 });
    const second = await createSection(wellId, { order: 2 });

    const { status, body } = await call("PATCH", `/sections/${second.id}`, {
      order: 1,
    });

    expect(status).toBe(409);
    expect(body.code).toBe("SECTION_ORDER_TAKEN");
  });

  test("lets a section keep its own order", async () => {
    const section = await createSection(wellId, { order: 1 });

    const { status } = await call("PATCH", `/sections/${section.id}`, {
      order: 1,
    });

    expect(status).toBe(200);
  });

  test("can move a section to another well", async () => {
    const project = await createProject({ name: "Beta" });
    const other = await createWell(project.id, { name: "B-1" });
    const section = await createSection(wellId);

    const { body } = await call("PATCH", `/sections/${section.id}`, {
      well_id: other.id,
    });

    expect(body.data).toMatchObject({ well_id: other.id, well_name: "B-1" });
  });

  test("returns 404 when the new well does not exist", async () => {
    const section = await createSection(wellId);

    const { status } = await call("PATCH", `/sections/${section.id}`, {
      well_id: MISSING_ID,
    });

    expect(status).toBe(404);
  });

  test("rejects an empty patch with 422", async () => {
    const section = await createSection(wellId);

    const { status } = await call("PATCH", `/sections/${section.id}`, {});

    expect(status).toBe(422);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("PATCH", `/sections/${MISSING_ID}`, {
      hole_size: 8.5,
    });

    expect(status).toBe(404);
  });
});

const orders = async (wellId: string) =>
  (await call("GET", `/sections?well_id=${wellId}`)).body.data.map(
    (s: { id: string; order: number }) => [s.id, s.order],
  );

describe("POST /sections/:id/move", () => {
  test("moving down puts the section at the target and lifts the ones in between", async () => {
    const [a, b, c, d] = [
      await createSection(wellId),
      await createSection(wellId),
      await createSection(wellId),
      await createSection(wellId),
    ];

    const { status, body } = await call("POST", `/sections/${a.id}/move`, {
      to_order: 3,
    });

    expect(status).toBe(200);
    expect(body.data.order).toBe(3);
    expect(await orders(wellId)).toEqual([
      [b.id, 1],
      [c.id, 2],
      [a.id, 3],
      [d.id, 4],
    ]);
  });

  test("moving up puts the section at the target and pushes the ones in between down", async () => {
    const [a, b, c, d] = [
      await createSection(wellId),
      await createSection(wellId),
      await createSection(wellId),
      await createSection(wellId),
    ];

    await call("POST", `/sections/${d.id}/move`, { to_order: 2 });

    expect(await orders(wellId)).toEqual([
      [a.id, 1],
      [d.id, 2],
      [b.id, 3],
      [c.id, 4],
    ]);
  });

  test("swaps two neighbours", async () => {
    const a = await createSection(wellId);
    const b = await createSection(wellId);

    await call("POST", `/sections/${b.id}/move`, { to_order: 1 });

    expect(await orders(wellId)).toEqual([
      [b.id, 1],
      [a.id, 2],
    ]);
  });

  test("moving onto its own order changes nothing", async () => {
    const a = await createSection(wellId);
    await createSection(wellId);

    const { status, body } = await call("POST", `/sections/${a.id}/move`, {
      to_order: 1,
    });

    expect(status).toBe(200);
    expect(body.data.order).toBe(1);
  });

  test("leaves the sections of other wells alone", async () => {
    const project = await createProject({ name: "Beta" });
    const other = await createWell(project.id, { name: "B-1" });
    const first = await createSection(wellId);
    await createSection(wellId);
    const foreign = await createSection(other.id);

    await call("POST", `/sections/${first.id}/move`, { to_order: 2 });

    expect(await orders(other.id)).toEqual([[foreign.id, 1]]);
  });

  test("keeps gaps in the orders unique", async () => {
    const a = await createSection(wellId, { order: 1 });
    const b = await createSection(wellId, { order: 5 });

    await call("POST", `/sections/${a.id}/move`, { to_order: 5 });

    expect(await orders(wellId)).toEqual([
      [b.id, 4],
      [a.id, 5],
    ]);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("POST", `/sections/${MISSING_ID}/move`, {
      to_order: 1,
    });

    expect(status).toBe(404);
  });

  test.each([{ to_order: 0 }, { to_order: 1.5 }, {}])(
    "rejects %o with 422",
    async (bad) => {
      const section = await createSection(wellId);

      const { status } = await call(
        "POST",
        `/sections/${section.id}/move`,
        bad,
      );

      expect(status).toBe(422);
    },
  );
});

describe("DELETE /sections/:id", () => {
  test("deletes the section and returns 204", async () => {
    const section = await createSection(wellId);

    const deleted = await call("DELETE", `/sections/${section.id}`);
    const after = await call("GET", `/sections/${section.id}`);

    expect(deleted.status).toBe(204);
    expect(deleted.body).toBeUndefined();
    expect(after.status).toBe(404);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("DELETE", `/sections/${MISSING_ID}`);

    expect(status).toBe(404);
  });

  test("sections have no archive endpoint", async () => {
    const section = await createSection(wellId);

    const { status } = await call("POST", `/sections/${section.id}/archive`);

    expect(status).toBe(404);
  });
});

describe("deleting a well that has sections", () => {
  test("returns 409 and keeps the well", async () => {
    await createSection(wellId);

    const { status, body } = await call("DELETE", `/wells/${wellId}`);

    expect(status).toBe(409);
    expect(body.code).toBe("WELL_HAS_SECTIONS");
    expect((await call("GET", `/wells/${wellId}`)).status).toBe(200);
  });

  test("works once the sections are deleted", async () => {
    const section = await createSection(wellId);
    await call("DELETE", `/sections/${section.id}`);

    const { status } = await call("DELETE", `/wells/${wellId}`);

    expect(status).toBe(204);
  });
});

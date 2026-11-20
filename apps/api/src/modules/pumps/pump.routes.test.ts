import { beforeEach, describe, expect, test } from "bun:test";
import {
  call,
  createProject,
  createPump,
  MISSING_ID,
  pumpPayload,
  resetDb,
} from "../../test/helpers";

let projectId: string;

beforeEach(async () => {
  await resetDb();
  projectId = (await createProject({ name: "Alpha" })).id;
});

describe("POST /pumps", () => {
  test("creates a pump and returns its project name and output per stroke", async () => {
    const { status, body } = await call(
      "POST",
      "/pumps",
      pumpPayload(projectId, { order: 2, efficiency: 97.5 }),
    );

    expect(status).toBe(201);
    expect(body.data).toMatchObject({
      project_id: projectId,
      project_name: "Alpha",
      order: 2,
      model: "FH 1500",
      type: "triplex",
      liner_diameter: 6,
      stroke_length: 12,
      efficiency: 97.5,
    });
    expect(body.data.gal_per_stroke).toBeCloseTo(4.296, 3);
    expect(body.data).not.toHaveProperty("created_by");
  });

  test("matches the sheet: a 6.5 inch liner at 95 % gives 4.91 gal/stroke", async () => {
    const pump = await createPump(projectId, { liner_diameter: 6.5 });

    expect(pump.gal_per_stroke).toBeCloseTo(4.91, 2);
  });

  test("a duplex has no output per stroke", async () => {
    const pump = await createPump(projectId, { type: "duplex" });

    expect(pump.gal_per_stroke).toBeNull();
  });

  test("without an order, the pump goes after the last one", async () => {
    const first = await createPump(projectId);
    const second = await createPump(projectId);
    await createPump(projectId, { order: 10 });
    const last = await createPump(projectId);

    expect([first.order, second.order, last.order]).toEqual([1, 2, 11]);
  });

  test("numbers the pumps of each project on their own", async () => {
    const other = await createProject({ name: "Beta" });
    await createPump(projectId);
    await createPump(projectId);

    const pump = await createPump(other.id);

    expect(pump.order).toBe(1);
  });

  test("rejects an order that the project already uses with 409", async () => {
    await createPump(projectId, { order: 1 });

    const { status, body } = await call(
      "POST",
      "/pumps",
      pumpPayload(projectId, { order: 1 }),
    );

    expect(status).toBe(409);
    expect(body.code).toBe("PUMP_ORDER_TAKEN");
  });

  test("allows the same order in another project", async () => {
    const other = await createProject({ name: "Beta" });
    await createPump(projectId, { order: 1 });

    const { status } = await call(
      "POST",
      "/pumps",
      pumpPayload(other.id, { order: 1 }),
    );

    expect(status).toBe(201);
  });

  test("returns 404 when the project does not exist", async () => {
    const { status, body } = await call(
      "POST",
      "/pumps",
      pumpPayload(MISSING_ID),
    );

    expect(status).toBe(404);
    expect(body.message).toBe("Project was not found.");
  });

  test.each([
    { model: "" },
    { type: "quintuplex" },
    { liner_diameter: 0 },
    { liner_diameter: "6" },
    { stroke_length: -12 },
    { efficiency: 0 },
    { efficiency: 101 },
    { efficiency: 95.123 },
    { order: 0 },
    { order: 1.5 },
    { project_id: "not-a-uuid" },
  ])("rejects %o with 422", async (bad) => {
    const { status, body } = await call(
      "POST",
      "/pumps",
      pumpPayload(projectId, bad),
    );

    expect(status).toBe(422);
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  test("rejects a missing model with 422", async () => {
    const { model: _model, ...withoutModel } = pumpPayload(projectId);

    const { status } = await call("POST", "/pumps", withoutModel);

    expect(status).toBe(422);
  });
});

describe("GET /pumps", () => {
  test("returns an empty page when there are no pumps", async () => {
    const { status, body } = await call("GET", "/pumps");

    expect(status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.meta).toEqual({ page: 1, pageSize: 20, total: 0 });
  });

  test("lists the pumps of a project in their order", async () => {
    await createPump(projectId, { order: 3 });
    await createPump(projectId, { order: 1 });
    await createPump(projectId, { order: 2 });

    const { body } = await call("GET", "/pumps");

    expect(body.data.map((p: { order: number }) => p.order)).toEqual([1, 2, 3]);
  });

  test("filters by project and counts only that project's pumps", async () => {
    const other = await createProject({ name: "Beta" });
    await createPump(projectId);
    const wanted = await createPump(other.id);

    const { body } = await call("GET", `/pumps?project_id=${other.id}`);

    expect(body.data.map((p: { id: string }) => p.id)).toEqual([wanted.id]);
    expect(body.meta.total).toBe(1);
  });

  test("pages the results and reports the total", async () => {
    for (let i = 0; i < 3; i++) await createPump(projectId);

    const second = await call("GET", "/pumps?page=2&pageSize=2");

    expect(second.body.data).toHaveLength(1);
    expect(second.body.meta).toEqual({ page: 2, pageSize: 2, total: 3 });
  });

  test.each(["page=0", "pageSize=101", "project_id=nope"])(
    "rejects the query %s with 422",
    async (query) => {
      const { status } = await call("GET", `/pumps?${query}`);

      expect(status).toBe(422);
    },
  );
});

describe("GET /pumps/:id", () => {
  test("returns the pump", async () => {
    const pump = await createPump(projectId);

    const { status, body } = await call("GET", `/pumps/${pump.id}`);

    expect(status).toBe(200);
    expect(body.data).toEqual(pump);
  });

  test("returns 404 for an unknown id", async () => {
    const { status, body } = await call("GET", `/pumps/${MISSING_ID}`);

    expect(status).toBe(404);
    expect(body.code).toBe("NOT_FOUND");
  });

  test("returns 422 for an id that is not a uuid", async () => {
    const { status } = await call("GET", "/pumps/not-a-uuid");

    expect(status).toBe(422);
  });
});

describe("PATCH /pumps/:id", () => {
  test("changes only the sent fields and recomputes the output", async () => {
    const pump = await createPump(projectId);

    const { status, body } = await call("PATCH", `/pumps/${pump.id}`, {
      liner_diameter: 6.5,
    });

    expect(status).toBe(200);
    expect(body.data).toMatchObject({
      liner_diameter: 6.5,
      model: "FH 1500",
      order: pump.order,
    });
    expect(body.data.gal_per_stroke).toBeCloseTo(4.91, 2);
  });

  test("rejects an order that another pump of the project uses with 409", async () => {
    await createPump(projectId, { order: 1 });
    const second = await createPump(projectId, { order: 2 });

    const { status, body } = await call("PATCH", `/pumps/${second.id}`, {
      order: 1,
    });

    expect(status).toBe(409);
    expect(body.code).toBe("PUMP_ORDER_TAKEN");
  });

  test("lets a pump keep its own order", async () => {
    const pump = await createPump(projectId, { order: 1 });

    const { status } = await call("PATCH", `/pumps/${pump.id}`, { order: 1 });

    expect(status).toBe(200);
  });

  test("returns 404 when the new project does not exist", async () => {
    const pump = await createPump(projectId);

    const { status } = await call("PATCH", `/pumps/${pump.id}`, {
      project_id: MISSING_ID,
    });

    expect(status).toBe(404);
  });

  test("rejects an empty patch with 422", async () => {
    const pump = await createPump(projectId);

    const { status } = await call("PATCH", `/pumps/${pump.id}`, {});

    expect(status).toBe(422);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("PATCH", `/pumps/${MISSING_ID}`, {
      efficiency: 90,
    });

    expect(status).toBe(404);
  });
});

describe("DELETE /pumps/:id", () => {
  test("deletes the pump and returns 204", async () => {
    const pump = await createPump(projectId);

    const deleted = await call("DELETE", `/pumps/${pump.id}`);
    const after = await call("GET", `/pumps/${pump.id}`);

    expect(deleted.status).toBe(204);
    expect(after.status).toBe(404);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("DELETE", `/pumps/${MISSING_ID}`);

    expect(status).toBe(404);
  });
});

describe("deleting a project that has pumps", () => {
  test("returns 409 and keeps the project", async () => {
    await createPump(projectId);

    const { status, body } = await call("DELETE", `/projects/${projectId}`);

    expect(status).toBe(409);
    expect(body.code).toBe("PROJECT_HAS_PUMPS");
    expect((await call("GET", `/projects/${projectId}`)).status).toBe(200);
  });
});

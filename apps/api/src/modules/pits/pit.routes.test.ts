import { beforeEach, describe, expect, test } from "bun:test";
import {
  call,
  createPit,
  createProject,
  MISSING_ID,
  pitPayload,
  resetDb,
} from "../../test/helpers";

let projectId: string;

beforeEach(async () => {
  await resetDb();
  projectId = (await createProject({ name: "Alpha" })).id;
});

describe("POST /pits", () => {
  test("creates a pit and returns its project name", async () => {
    const { status, body } = await call(
      "POST",
      "/pits",
      pitPayload(projectId, { name: "Active 1", order: 2, capacity: 120.5 }),
    );

    expect(status).toBe(201);
    expect(body.data).toMatchObject({
      project_id: projectId,
      project_name: "Alpha",
      order: 2,
      name: "Active 1",
      type: "active",
      capacity: 120.5,
    });
  });

  test("a pit may have no capacity", async () => {
    const pit = await createPit(projectId, { capacity: null });

    expect(pit.capacity).toBeNull();
  });

  test("without an order, the pit goes after the last one", async () => {
    const first = await createPit(projectId);
    const second = await createPit(projectId);
    await createPit(projectId, { order: 10 });
    const last = await createPit(projectId);

    expect([first.order, second.order, last.order]).toEqual([1, 2, 11]);
  });

  test("rejects a name that the project already uses with 409", async () => {
    await createPit(projectId, { name: "Pit A" });

    const { status, body } = await call(
      "POST",
      "/pits",
      pitPayload(projectId, { name: "Pit A" }),
    );

    expect(status).toBe(409);
    expect(body.code).toBe("PIT_NAME_TAKEN");
  });

  test("allows the same name in another project", async () => {
    const other = await createProject({ name: "Beta" });
    await createPit(projectId, { name: "Pit A" });

    const { status } = await call(
      "POST",
      "/pits",
      pitPayload(other.id, { name: "Pit A" }),
    );

    expect(status).toBe(201);
  });

  test("returns 404 when the project does not exist", async () => {
    const { status, body } = await call(
      "POST",
      "/pits",
      pitPayload(MISSING_ID),
    );

    expect(status).toBe(404);
    expect(body.message).toBe("Project was not found.");
  });

  test.each([
    { name: "" },
    { type: "tank" },
    { capacity: 0 },
    { capacity: -5 },
    { capacity: "250" },
    { capacity: 1.234 },
    { order: 0 },
    { project_id: "not-a-uuid" },
  ])("rejects %o with 422", async (bad) => {
    const { status, body } = await call(
      "POST",
      "/pits",
      pitPayload(projectId, bad),
    );

    expect(status).toBe(422);
    expect(body.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /pits", () => {
  test("returns an empty page when there are no pits", async () => {
    const { status, body } = await call("GET", "/pits");

    expect(status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.meta).toEqual({ page: 1, pageSize: 20, total: 0 });
  });

  test("lists the pits of a project in their order", async () => {
    await createPit(projectId, { order: 3 });
    await createPit(projectId, { order: 1 });
    await createPit(projectId, { order: 2 });

    const { body } = await call("GET", "/pits");

    expect(body.data.map((p: { order: number }) => p.order)).toEqual([1, 2, 3]);
  });

  test("filters by project and counts only that project's pits", async () => {
    const other = await createProject({ name: "Beta" });
    await createPit(projectId);
    const wanted = await createPit(other.id);

    const { body } = await call("GET", `/pits?project_id=${other.id}`);

    expect(body.data.map((p: { id: string }) => p.id)).toEqual([wanted.id]);
    expect(body.meta.total).toBe(1);
  });

  test("pages the results and reports the total", async () => {
    for (let i = 0; i < 3; i++) await createPit(projectId);

    const second = await call("GET", "/pits?page=2&pageSize=2");

    expect(second.body.data).toHaveLength(1);
    expect(second.body.meta).toEqual({ page: 2, pageSize: 2, total: 3 });
  });

  test.each(["page=0", "pageSize=101", "project_id=nope"])(
    "rejects the query %s with 422",
    async (query) => {
      const { status } = await call("GET", `/pits?${query}`);

      expect(status).toBe(422);
    },
  );
});

describe("GET /pits/:id", () => {
  test("returns the pit", async () => {
    const pit = await createPit(projectId);

    const { status, body } = await call("GET", `/pits/${pit.id}`);

    expect(status).toBe(200);
    expect(body.data).toEqual(pit);
  });

  test("returns 404 for an unknown id", async () => {
    const { status, body } = await call("GET", `/pits/${MISSING_ID}`);

    expect(status).toBe(404);
    expect(body.code).toBe("NOT_FOUND");
  });

  test("returns 422 for an id that is not a uuid", async () => {
    const { status } = await call("GET", "/pits/not-a-uuid");

    expect(status).toBe(422);
  });
});

describe("PATCH /pits/:id", () => {
  test("changes only the sent fields", async () => {
    const pit = await createPit(projectId, { name: "Pit A" });

    const { status, body } = await call("PATCH", `/pits/${pit.id}`, {
      type: "reserve",
    });

    expect(status).toBe(200);
    expect(body.data).toMatchObject({
      type: "reserve",
      name: "Pit A",
      capacity: 250,
      order: pit.order,
    });
  });

  test("clears the capacity with null", async () => {
    const pit = await createPit(projectId);

    const { body } = await call("PATCH", `/pits/${pit.id}`, {
      capacity: null,
    });

    expect(body.data.capacity).toBeNull();
  });

  test("rejects a name that another pit of the project uses with 409", async () => {
    await createPit(projectId, { name: "Pit A" });
    const second = await createPit(projectId, { name: "Pit B" });

    const { status, body } = await call("PATCH", `/pits/${second.id}`, {
      name: "Pit A",
    });

    expect(status).toBe(409);
    expect(body.code).toBe("PIT_NAME_TAKEN");
  });

  test("lets a pit keep its own name", async () => {
    const pit = await createPit(projectId, { name: "Pit A" });

    const { status } = await call("PATCH", `/pits/${pit.id}`, {
      name: "Pit A",
    });

    expect(status).toBe(200);
  });

  test("returns 404 when the new project does not exist", async () => {
    const pit = await createPit(projectId);

    const { status } = await call("PATCH", `/pits/${pit.id}`, {
      project_id: MISSING_ID,
    });

    expect(status).toBe(404);
  });

  test("rejects an empty patch with 422", async () => {
    const pit = await createPit(projectId);

    const { status } = await call("PATCH", `/pits/${pit.id}`, {});

    expect(status).toBe(422);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("PATCH", `/pits/${MISSING_ID}`, {
      capacity: 10,
    });

    expect(status).toBe(404);
  });
});

describe("DELETE /pits/:id", () => {
  test("deletes the pit and returns 204", async () => {
    const pit = await createPit(projectId);

    const deleted = await call("DELETE", `/pits/${pit.id}`);
    const after = await call("GET", `/pits/${pit.id}`);

    expect(deleted.status).toBe(204);
    expect(after.status).toBe(404);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("DELETE", `/pits/${MISSING_ID}`);

    expect(status).toBe(404);
  });
});

describe("deleting a project that has pits", () => {
  test("returns 409 and keeps the project", async () => {
    await createPit(projectId);

    const { status, body } = await call("DELETE", `/projects/${projectId}`);

    expect(status).toBe(409);
    expect(body.code).toBe("PROJECT_HAS_PITS");
    expect((await call("GET", `/projects/${projectId}`)).status).toBe(200);
  });
});

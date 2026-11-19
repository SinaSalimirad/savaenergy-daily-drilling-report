import { beforeEach, describe, expect, test } from "bun:test";
import {
  call,
  createProject,
  createWell,
  MISSING_ID,
  projectPayload,
  resetDb,
} from "../../test/helpers";

beforeEach(resetDb);

describe("POST /projects", () => {
  test("creates a project and returns it without internal columns", async () => {
    const payload = projectPayload({ name: "Alpha", currency: "EUR" });

    const { status, body } = await call("POST", "/projects", payload);

    expect(status).toBe(201);
    expect(body.data).toMatchObject({ ...payload, archived_at: null });
    expect(body.data.id).toBeString();
    expect(body.data).not.toHaveProperty("created_by");
    expect(body.data).not.toHaveProperty("archived_by");
  });

  test("trims the text fields", async () => {
    const { body } = await call(
      "POST",
      "/projects",
      projectPayload({ name: "  Alpha  " }),
    );

    expect(body.data.name).toBe("Alpha");
  });

  test("a new project with no wells is inactive", async () => {
    const project = await createProject();

    expect(project.status).toBe("inactive");
  });

  test("rejects a duplicate name with 409", async () => {
    await createProject({ name: "Alpha" });

    const { status, body } = await call(
      "POST",
      "/projects",
      projectPayload({ name: "Alpha" }),
    );

    expect(status).toBe(409);
    expect(body.code).toBe("PROJECT_NAME_TAKEN");
  });

  test("rejects an invalid body with 422 and a message per field", async () => {
    const { status, body } = await call(
      "POST",
      "/projects",
      projectPayload({ name: "", wells: 0, currency: "GBP" }),
    );

    expect(status).toBe(422);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.errors.length).toBeGreaterThanOrEqual(3);
  });

  test("rejects a missing body with 422", async () => {
    const { status } = await call("POST", "/projects", {});

    expect(status).toBe(422);
  });
});

describe("GET /projects", () => {
  test("returns an empty page when there are no projects", async () => {
    const { status, body } = await call("GET", "/projects");

    expect(status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.meta).toEqual({ page: 1, pageSize: 20, total: 0 });
  });

  test("lists the newest project first", async () => {
    await createProject({ name: "First" });
    await createProject({ name: "Second" });

    const { body } = await call("GET", "/projects");

    expect(body.data.map((p: { name: string }) => p.name)).toEqual([
      "Second",
      "First",
    ]);
  });

  test("pages the results and reports the total", async () => {
    for (const name of ["A", "B", "C"]) await createProject({ name });

    const first = await call("GET", "/projects?page=1&pageSize=2");
    const second = await call("GET", "/projects?page=2&pageSize=2");

    expect(first.body.data).toHaveLength(2);
    expect(second.body.data).toHaveLength(1);
    expect(second.body.meta).toEqual({ page: 2, pageSize: 2, total: 3 });
  });

  test("never repeats a project across pages", async () => {
    for (const name of ["A", "B", "C", "D"]) await createProject({ name });

    const first = await call("GET", "/projects?page=1&pageSize=2");
    const second = await call("GET", "/projects?page=2&pageSize=2");
    const ids = [...first.body.data, ...second.body.data].map(
      (p: { id: string }) => p.id,
    );

    expect(new Set(ids).size).toBe(4);
  });

  test.each([
    "page=0",
    "pageSize=0",
    "pageSize=101",
    "page=abc",
    "archived=maybe",
  ])("rejects the query %s with 422", async (query) => {
    const { status } = await call("GET", `/projects?${query}`);

    expect(status).toBe(422);
  });

  test("keeps archived projects out of the default list", async () => {
    const kept = await createProject({ name: "Kept" });
    const archived = await createProject({ name: "Archived" });
    await call("POST", `/projects/${archived.id}/archive`);

    const active = await call("GET", "/projects");
    const archivedList = await call("GET", "/projects?archived=true");

    expect(active.body.data.map((p: { id: string }) => p.id)).toEqual([
      kept.id,
    ]);
    expect(archivedList.body.data.map((p: { id: string }) => p.id)).toEqual([
      archived.id,
    ]);
    expect(archivedList.body.meta.total).toBe(1);
  });
});

describe("GET /projects/:id", () => {
  test("returns the project", async () => {
    const project = await createProject();

    const { status, body } = await call("GET", `/projects/${project.id}`);

    expect(status).toBe(200);
    expect(body.data).toEqual(project);
  });

  test("returns 404 for an unknown id", async () => {
    const { status, body } = await call("GET", `/projects/${MISSING_ID}`);

    expect(status).toBe(404);
    expect(body.code).toBe("NOT_FOUND");
  });

  test("returns 422 for an id that is not a uuid", async () => {
    const { status } = await call("GET", "/projects/not-a-uuid");

    expect(status).toBe(422);
  });
});

describe("project status", () => {
  test("is active while one of its wells is active", async () => {
    const project = await createProject();
    await createWell(project.id, { status: "active" });

    const { body } = await call("GET", `/projects/${project.id}`);

    expect(body.data.status).toBe("active");
  });

  test("is inactive when none of its wells is active", async () => {
    const project = await createProject();
    await createWell(project.id, { status: "planned" });
    await createWell(project.id, { status: "completed" });

    const { body } = await call("GET", `/projects/${project.id}`);

    expect(body.data.status).toBe("inactive");
  });

  test("ignores an active well that is archived", async () => {
    const project = await createProject();
    const well = await createWell(project.id, { status: "active" });
    await call("POST", `/wells/${well.id}/archive`);

    const { body } = await call("GET", `/projects/${project.id}`);

    expect(body.data.status).toBe("inactive");
  });

  test("is active again when that well is restored", async () => {
    const project = await createProject();
    const well = await createWell(project.id, { status: "active" });
    await call("POST", `/wells/${well.id}/archive`);
    await call("POST", `/wells/${well.id}/restore`);

    const { body } = await call("GET", `/projects/${project.id}`);

    expect(body.data.status).toBe("active");
  });

  test("is archived once the project is archived, even with an active well", async () => {
    const project = await createProject();
    await createWell(project.id, { status: "active" });

    const { body } = await call("POST", `/projects/${project.id}/archive`);

    expect(body.data.status).toBe("archived");
  });
});

describe("PATCH /projects/:id", () => {
  test("changes only the sent fields", async () => {
    const project = await createProject({ name: "Alpha", field: "North" });

    const { status, body } = await call("PATCH", `/projects/${project.id}`, {
      field: "South",
    });

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ name: "Alpha", field: "South" });
  });

  test("moves updated_at forward", async () => {
    const project = await createProject();

    const { body } = await call("PATCH", `/projects/${project.id}`, {
      operator: "New Operator",
    });

    expect(Date.parse(body.data.updated_at)).toBeGreaterThanOrEqual(
      Date.parse(project.updated_at),
    );
  });

  test("rejects an empty patch with 422", async () => {
    const project = await createProject();

    const { status } = await call("PATCH", `/projects/${project.id}`, {});

    expect(status).toBe(422);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("PATCH", `/projects/${MISSING_ID}`, {
      field: "South",
    });

    expect(status).toBe(404);
  });

  test("rejects a name that another project already uses with 409", async () => {
    await createProject({ name: "Alpha" });
    const beta = await createProject({ name: "Beta" });

    const { status, body } = await call("PATCH", `/projects/${beta.id}`, {
      name: "Alpha",
    });

    expect(status).toBe(409);
    expect(body.code).toBe("PROJECT_NAME_TAKEN");
  });

  test("lets a project keep its own name", async () => {
    const project = await createProject({ name: "Alpha" });

    const { status } = await call("PATCH", `/projects/${project.id}`, {
      name: "Alpha",
    });

    expect(status).toBe(200);
  });

  test("ignores archived_at sent by a client", async () => {
    const project = await createProject();

    await call("PATCH", `/projects/${project.id}`, {
      field: "South",
      archived_at: new Date().toISOString(),
    });
    const { body } = await call("GET", `/projects/${project.id}`);

    expect(body.data.archived_at).toBeNull();
  });
});

describe("archive and restore", () => {
  test("archive sets archived_at", async () => {
    const project = await createProject();

    const { status, body } = await call(
      "POST",
      `/projects/${project.id}/archive`,
    );

    expect(status).toBe(200);
    expect(body.data.archived_at).toBeString();
    expect(body.data.status).toBe("archived");
  });

  test("archiving twice returns 409", async () => {
    const project = await createProject();
    await call("POST", `/projects/${project.id}/archive`);

    const { status, body } = await call(
      "POST",
      `/projects/${project.id}/archive`,
    );

    expect(status).toBe(409);
    expect(body.code).toBe("PROJECT_ALREADY_ARCHIVED");
  });

  test("archiving an unknown project returns 404", async () => {
    const { status } = await call("POST", `/projects/${MISSING_ID}/archive`);

    expect(status).toBe(404);
  });

  test("restore clears archived_at", async () => {
    const project = await createProject();
    await call("POST", `/projects/${project.id}/archive`);

    const { status, body } = await call(
      "POST",
      `/projects/${project.id}/restore`,
    );

    expect(status).toBe(200);
    expect(body.data.archived_at).toBeNull();
    expect(body.data.status).toBe("inactive");
  });

  test("restoring a project that is not archived returns 409", async () => {
    const project = await createProject();

    const { status, body } = await call(
      "POST",
      `/projects/${project.id}/restore`,
    );

    expect(status).toBe(409);
    expect(body.code).toBe("PROJECT_NOT_ARCHIVED");
  });

  test("restoring an unknown project returns 404", async () => {
    const { status } = await call("POST", `/projects/${MISSING_ID}/restore`);

    expect(status).toBe(404);
  });

  test("two parallel archive requests: one wins, one gets 409", async () => {
    const project = await createProject();

    const results = await Promise.all([
      call("POST", `/projects/${project.id}/archive`),
      call("POST", `/projects/${project.id}/archive`),
    ]);

    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
  });
});

describe("DELETE /projects/:id", () => {
  test("deletes the project and returns 204", async () => {
    const project = await createProject();

    const deleted = await call("DELETE", `/projects/${project.id}`);
    const after = await call("GET", `/projects/${project.id}`);

    expect(deleted.status).toBe(204);
    expect(deleted.body).toBeUndefined();
    expect(after.status).toBe(404);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("DELETE", `/projects/${MISSING_ID}`);

    expect(status).toBe(404);
  });

  test("returns 409 when the project still has wells", async () => {
    const project = await createProject();
    const well = await createWell(project.id);

    const { status, body } = await call("DELETE", `/projects/${project.id}`);

    expect(status).toBe(409);
    expect(body.code).toBe("PROJECT_HAS_WELLS");
    // Nothing was deleted.
    expect((await call("GET", `/wells/${well.id}`)).status).toBe(200);
  });

  test("can be deleted once its wells are gone", async () => {
    const project = await createProject();
    const well = await createWell(project.id);
    await call("DELETE", `/wells/${well.id}`);

    const { status } = await call("DELETE", `/projects/${project.id}`);

    expect(status).toBe(204);
  });
});

describe("app", () => {
  test("GET /health answers ok", async () => {
    const { status, body } = await call("GET", "/health");

    expect(status).toBe(200);
    expect(body).toEqual({ data: { status: "ok" } });
  });

  test("an unknown route returns the standard 404 body", async () => {
    const { status, body } = await call("GET", "/nope");

    expect(status).toBe(404);
    expect(body.code).toBe("NOT_FOUND");
  });
});

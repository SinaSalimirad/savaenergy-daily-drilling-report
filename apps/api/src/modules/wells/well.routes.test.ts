import { beforeEach, describe, expect, test } from "bun:test";
import {
  call,
  createProject,
  createWell,
  MISSING_ID,
  resetDb,
  wellPayload,
} from "../../test/helpers";

let projectId: string;

beforeEach(async () => {
  await resetDb();
  projectId = (await createProject({ name: "Alpha" })).id;
});

describe("POST /wells", () => {
  test("creates a well and returns the project name with it", async () => {
    const payload = wellPayload(projectId, {
      name: "A-1",
      designation: "exploration",
      well_type: "vertical",
      spud_date: "2026-03-01",
    });

    const { status, body } = await call("POST", "/wells", payload);

    expect(status).toBe(201);
    expect(body.data).toMatchObject({
      ...payload,
      project_name: "Alpha",
      water_depth: null,
    });
    expect(body.data).not.toHaveProperty("created_by");
  });

  test("stores the water depth of an offshore well as a number", async () => {
    const { status, body } = await call(
      "POST",
      "/wells",
      wellPayload(projectId, { rig_type: "offshore", water_depth: 120.5 }),
    );

    expect(status).toBe(201);
    expect(body.data.water_depth).toBe(120.5);
  });

  test("rejects a water depth on an onshore well with 422", async () => {
    const { status, body } = await call(
      "POST",
      "/wells",
      wellPayload(projectId, { rig_type: "onshore", water_depth: 10 }),
    );

    expect(status).toBe(422);
    expect(body.errors[0].message).toContain("offshore");
  });

  test("rejects a negative water depth with 422", async () => {
    const { status } = await call(
      "POST",
      "/wells",
      wellPayload(projectId, { rig_type: "offshore", water_depth: -1 }),
    );

    expect(status).toBe(422);
  });

  test("rejects the archived status: wells cannot be archived", async () => {
    const { status } = await call(
      "POST",
      "/wells",
      wellPayload(projectId, { status: "archived" }),
    );

    expect(status).toBe(422);
  });

  test("rejects a missing name with 422", async () => {
    const { status, body } = await call(
      "POST",
      "/wells",
      wellPayload(projectId, { name: " " }),
    );

    expect(status).toBe(422);
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  test("returns 404 when the project does not exist", async () => {
    const { status, body } = await call(
      "POST",
      "/wells",
      wellPayload(MISSING_ID),
    );

    expect(status).toBe(404);
    expect(body.message).toBe("Project was not found.");
  });

  test("rejects a duplicate name in the same project with 409", async () => {
    await createWell(projectId, { name: "A-1" });

    const { status, body } = await call(
      "POST",
      "/wells",
      wellPayload(projectId, { name: "A-1" }),
    );

    expect(status).toBe(409);
    expect(body.code).toBe("WELL_NAME_TAKEN");
  });

  test("allows the same name in another project", async () => {
    const other = await createProject({ name: "Beta" });
    await createWell(projectId, { name: "A-1" });

    const { status } = await call(
      "POST",
      "/wells",
      wellPayload(other.id, { name: "A-1" }),
    );

    expect(status).toBe(201);
  });
});

describe("GET /wells", () => {
  test("returns an empty page when there are no wells", async () => {
    const { status, body } = await call("GET", "/wells");

    expect(status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.meta).toEqual({ page: 1, pageSize: 20, total: 0 });
  });

  test("lists the newest well first", async () => {
    await createWell(projectId, { name: "First" });
    await createWell(projectId, { name: "Second" });

    const { body } = await call("GET", "/wells");

    expect(body.data.map((w: { name: string }) => w.name)).toEqual([
      "Second",
      "First",
    ]);
  });

  test("pages the results and reports the total", async () => {
    for (const name of ["A", "B", "C"]) await createWell(projectId, { name });

    const second = await call("GET", "/wells?page=2&pageSize=2");

    expect(second.body.data).toHaveLength(1);
    expect(second.body.meta).toEqual({ page: 2, pageSize: 2, total: 3 });
  });

  test("lists only the wells of the requested project and counts only those", async () => {
    const otherProjectId = (await createProject({ name: "Beta" })).id;
    const mine = await createWell(projectId, { name: "Mine" });
    await createWell(otherProjectId, { name: "Theirs" });

    const { body } = await call("GET", `/wells?project_id=${projectId}`);

    expect(body.data.map((w: { id: string }) => w.id)).toEqual([mine.id]);
    expect(body.meta.total).toBe(1);
  });

  test("returns an empty page for a project without wells", async () => {
    await createWell(projectId);

    const { status, body } = await call(
      "GET",
      `/wells?project_id=${MISSING_ID}`,
    );

    expect(status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.meta.total).toBe(0);
  });

  test.each(["page=0", "pageSize=101", "project_id=not-a-uuid"])(
    "rejects the query %s with 422",
    async (query) => {
      const { status } = await call("GET", `/wells?${query}`);

      expect(status).toBe(422);
    },
  );
});

describe("GET /wells/:id", () => {
  test("returns the well", async () => {
    const well = await createWell(projectId);

    const { status, body } = await call("GET", `/wells/${well.id}`);

    expect(status).toBe(200);
    expect(body.data).toEqual(well);
  });

  test("returns 404 for an unknown id", async () => {
    const { status, body } = await call("GET", `/wells/${MISSING_ID}`);

    expect(status).toBe(404);
    expect(body.code).toBe("NOT_FOUND");
  });

  test("returns 422 for an id that is not a uuid", async () => {
    const { status } = await call("GET", "/wells/not-a-uuid");

    expect(status).toBe(422);
  });
});

describe("PATCH /wells/:id", () => {
  test("changes only the sent fields", async () => {
    const well = await createWell(projectId, {
      name: "A-1",
      rig_name: "Rig 1",
    });

    const { status, body } = await call("PATCH", `/wells/${well.id}`, {
      rig_name: "Rig 2",
    });

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ name: "A-1", rig_name: "Rig 2" });
  });

  test("clears an optional field when it is sent as null", async () => {
    const well = await createWell(projectId, { designation: "appraisal" });

    const { body } = await call("PATCH", `/wells/${well.id}`, {
      designation: null,
    });

    expect(body.data.designation).toBeNull();
  });

  test("moving a well to an onshore rig clears its water depth", async () => {
    const well = await createWell(projectId, {
      rig_type: "offshore",
      water_depth: 80,
    });

    const { status, body } = await call("PATCH", `/wells/${well.id}`, {
      rig_type: "onshore",
    });

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ rig_type: "onshore", water_depth: null });
  });

  test("setting a water depth on a stored onshore well returns 409", async () => {
    const well = await createWell(projectId, { rig_type: "onshore" });

    const { status, body } = await call("PATCH", `/wells/${well.id}`, {
      water_depth: 50,
    });

    expect(status).toBe(409);
    expect(body.code).toBe("WELL_WATER_DEPTH_ONSHORE");
  });

  test("rejects a patch that sets onshore and a depth together with 422", async () => {
    const well = await createWell(projectId);

    const { status } = await call("PATCH", `/wells/${well.id}`, {
      rig_type: "onshore",
      water_depth: 50,
    });

    expect(status).toBe(422);
  });

  test("can move a well to another project", async () => {
    const other = await createProject({ name: "Beta" });
    const well = await createWell(projectId);

    const { body } = await call("PATCH", `/wells/${well.id}`, {
      project_id: other.id,
    });

    expect(body.data).toMatchObject({
      project_id: other.id,
      project_name: "Beta",
    });
  });

  test("returns 404 when the new project does not exist", async () => {
    const well = await createWell(projectId);

    const { status } = await call("PATCH", `/wells/${well.id}`, {
      project_id: MISSING_ID,
    });

    expect(status).toBe(404);
  });

  test("rejects a name that is taken in the project with 409", async () => {
    await createWell(projectId, { name: "A-1" });
    const second = await createWell(projectId, { name: "A-2" });

    const { status, body } = await call("PATCH", `/wells/${second.id}`, {
      name: "A-1",
    });

    expect(status).toBe(409);
    expect(body.code).toBe("WELL_NAME_TAKEN");
  });

  test("rejects an empty patch with 422", async () => {
    const well = await createWell(projectId);

    const { status } = await call("PATCH", `/wells/${well.id}`, {});

    expect(status).toBe(422);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("PATCH", `/wells/${MISSING_ID}`, {
      rig_name: "Rig 2",
    });

    expect(status).toBe(404);
  });
});

describe("archive endpoints", () => {
  test("wells have no archive or restore endpoint", async () => {
    const well = await createWell(projectId);

    const archive = await call("POST", `/wells/${well.id}/archive`);
    const restore = await call("POST", `/wells/${well.id}/restore`);

    expect(archive.status).toBe(404);
    expect(restore.status).toBe(404);
  });
});

describe("DELETE /wells/:id", () => {
  test("deletes the well and returns 204", async () => {
    const well = await createWell(projectId);

    const deleted = await call("DELETE", `/wells/${well.id}`);
    const after = await call("GET", `/wells/${well.id}`);

    expect(deleted.status).toBe(204);
    expect(deleted.body).toBeUndefined();
    expect(after.status).toBe(404);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("DELETE", `/wells/${MISSING_ID}`);

    expect(status).toBe(404);
  });
});

import { beforeEach, describe, expect, test } from "bun:test";
import {
  call,
  createProject,
  createSce,
  MISSING_ID,
  resetDb,
  scePayload,
} from "../../test/helpers";

let projectId: string;

beforeEach(async () => {
  await resetDb();
  projectId = (await createProject({ name: "Alpha" })).id;
});

describe("POST /solid-control", () => {
  test("creates a unit of the sheet and returns the project name", async () => {
    const { status, body } = await call(
      "POST",
      "/solid-control",
      scePayload(projectId, {
        sort_order: 2,
        unit_no: 3,
        manufacturer: "Swaco",
        model: "Mongoose",
        screen_size: "140/140/140/140",
      }),
    );

    expect(status).toBe(201);
    expect(body.data).toMatchObject({
      project_id: projectId,
      project_name: "Alpha",
      sort_order: 2,
      type: "shale_shaker",
      unit_no: 3,
      manufacturer: "Swaco",
      model: "Mongoose",
      screen_size: "140/140/140/140",
    });
    expect(body.data).not.toHaveProperty("created_by");
  });

  test("manufacturer, model and screen size are optional", async () => {
    const unit = await createSce(projectId);

    expect([unit.manufacturer, unit.model, unit.screen_size]).toEqual([
      null,
      null,
      null,
    ]);
  });

  test("without a row or a number, the unit goes last", async () => {
    const first = await createSce(projectId);
    const second = await createSce(projectId);
    await createSce(projectId, { sort_order: 10 });
    const last = await createSce(projectId);

    expect([first.sort_order, second.sort_order, last.sort_order]).toEqual([
      1, 2, 11,
    ]);
  });

  test("numbers the units of each type on their own", async () => {
    const shaker1 = await createSce(projectId);
    const shaker2 = await createSce(projectId);
    const desander = await createSce(projectId, { type: "desander" });

    expect([shaker1.unit_no, shaker2.unit_no, desander.unit_no]).toEqual([
      1, 2, 1,
    ]);
  });

  test("numbers the rows of each project on their own", async () => {
    const other = await createProject({ name: "Beta" });
    await createSce(projectId);

    const unit = await createSce(other.id);

    expect([unit.sort_order, unit.unit_no]).toEqual([1, 1]);
  });

  test("rejects a row that the project already uses with 409", async () => {
    await createSce(projectId, { sort_order: 1 });

    const { status, body } = await call(
      "POST",
      "/solid-control",
      scePayload(projectId, { type: "desander", sort_order: 1 }),
    );

    expect(status).toBe(409);
    expect(body.code).toBe("SCE_SORT_ORDER_TAKEN");
  });

  test("rejects a number that the type already uses with 409", async () => {
    await createSce(projectId, { unit_no: 1 });

    const { status, body } = await call(
      "POST",
      "/solid-control",
      scePayload(projectId, { unit_no: 1 }),
    );

    expect(status).toBe(409);
    expect(body.code).toBe("SCE_UNIT_NO_TAKEN");
  });

  test("returns 404 when the project does not exist", async () => {
    const { status, body } = await call(
      "POST",
      "/solid-control",
      scePayload(MISSING_ID),
    );

    expect(status).toBe(404);
    expect(body.message).toBe("Project was not found.");
  });

  test.each([
    { type: "shaker" },
    { sort_order: 0 },
    { unit_no: 0 },
    { unit_no: 1.5 },
    { manufacturer: "" },
    { project_id: "not-a-uuid" },
  ])("rejects %o with 422", async (bad) => {
    const { status, body } = await call(
      "POST",
      "/solid-control",
      scePayload(projectId, bad),
    );

    expect(status).toBe(422);
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  test("rejects a missing type with 422", async () => {
    const { status } = await call("POST", "/solid-control", {
      project_id: projectId,
    });

    expect(status).toBe(422);
  });
});

describe("GET /solid-control", () => {
  test("returns an empty page when there is no equipment", async () => {
    const { status, body } = await call("GET", "/solid-control");

    expect(status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.meta).toEqual({ page: 1, pageSize: 20, total: 0 });
  });

  test("lists the units in the order of the sheet", async () => {
    await createSce(projectId, { sort_order: 3 });
    await createSce(projectId, { sort_order: 1, type: "desander" });
    await createSce(projectId, { sort_order: 2, type: "desilter" });

    const { body } = await call("GET", "/solid-control");

    expect(
      body.data.map((u: { sort_order: number }) => u.sort_order),
    ).toEqual([1, 2, 3]);
  });

  test("filters by project and counts only that project's units", async () => {
    const other = await createProject({ name: "Beta" });
    await createSce(projectId);
    const wanted = await createSce(other.id);

    const { body } = await call("GET", `/solid-control?project_id=${other.id}`);

    expect(body.data.map((u: { id: string }) => u.id)).toEqual([wanted.id]);
    expect(body.meta.total).toBe(1);
  });

  test("pages the results and reports the total", async () => {
    for (let i = 0; i < 3; i++) await createSce(projectId);

    const second = await call("GET", "/solid-control?page=2&pageSize=2");

    expect(second.body.data).toHaveLength(1);
    expect(second.body.meta).toEqual({ page: 2, pageSize: 2, total: 3 });
  });

  test.each(["page=0", "pageSize=101", "project_id=nope"])(
    "rejects the query %s with 422",
    async (query) => {
      const { status } = await call("GET", `/solid-control?${query}`);

      expect(status).toBe(422);
    },
  );
});

describe("GET /solid-control/:id", () => {
  test("returns the unit", async () => {
    const unit = await createSce(projectId);

    const { status, body } = await call("GET", `/solid-control/${unit.id}`);

    expect(status).toBe(200);
    expect(body.data).toEqual(unit);
  });

  test("returns 404 for an unknown id", async () => {
    const { status, body } = await call("GET", `/solid-control/${MISSING_ID}`);

    expect(status).toBe(404);
    expect(body.code).toBe("NOT_FOUND");
  });

  test("returns 422 for an id that is not a uuid", async () => {
    const { status } = await call("GET", "/solid-control/not-a-uuid");

    expect(status).toBe(422);
  });
});

describe("PATCH /solid-control/:id", () => {
  test("changes only the sent fields", async () => {
    const unit = await createSce(projectId, { manufacturer: "Swaco" });

    const { status, body } = await call("PATCH", `/solid-control/${unit.id}`, {
      model: "Mongoose",
    });

    expect(status).toBe(200);
    expect(body.data).toMatchObject({
      model: "Mongoose",
      manufacturer: "Swaco",
      sort_order: unit.sort_order,
    });
  });

  test("clears a field when it is sent as null", async () => {
    const unit = await createSce(projectId, { screen_size: "140/140" });

    const { body } = await call("PATCH", `/solid-control/${unit.id}`, {
      screen_size: null,
    });

    expect(body.data.screen_size).toBeNull();
  });

  test("rejects a row or a number that another unit uses with 409", async () => {
    await createSce(projectId, { sort_order: 1, unit_no: 1 });
    const second = await createSce(projectId, { sort_order: 2, unit_no: 2 });

    const byOrder = await call("PATCH", `/solid-control/${second.id}`, {
      sort_order: 1,
    });
    const byNumber = await call("PATCH", `/solid-control/${second.id}`, {
      unit_no: 1,
    });

    expect(byOrder.body.code).toBe("SCE_SORT_ORDER_TAKEN");
    expect(byNumber.body.code).toBe("SCE_UNIT_NO_TAKEN");
  });

  test("lets a unit keep its own row and number", async () => {
    const unit = await createSce(projectId, { sort_order: 1, unit_no: 1 });

    const { status } = await call("PATCH", `/solid-control/${unit.id}`, {
      sort_order: 1,
      unit_no: 1,
    });

    expect(status).toBe(200);
  });

  test("returns 404 when the new project does not exist", async () => {
    const unit = await createSce(projectId);

    const { status } = await call("PATCH", `/solid-control/${unit.id}`, {
      project_id: MISSING_ID,
    });

    expect(status).toBe(404);
  });

  test("rejects an empty patch with 422", async () => {
    const unit = await createSce(projectId);

    const { status } = await call("PATCH", `/solid-control/${unit.id}`, {});

    expect(status).toBe(422);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("PATCH", `/solid-control/${MISSING_ID}`, {
      model: "X",
    });

    expect(status).toBe(404);
  });
});

describe("DELETE /solid-control/:id", () => {
  test("deletes the unit and returns 204", async () => {
    const unit = await createSce(projectId);

    const deleted = await call("DELETE", `/solid-control/${unit.id}`);
    const after = await call("GET", `/solid-control/${unit.id}`);

    expect(deleted.status).toBe(204);
    expect(after.status).toBe(404);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("DELETE", `/solid-control/${MISSING_ID}`);

    expect(status).toBe(404);
  });
});

describe("deleting a project that has solid control equipment", () => {
  test("returns 409 and keeps the project", async () => {
    await createSce(projectId);

    const { status, body } = await call("DELETE", `/projects/${projectId}`);

    expect(status).toBe(409);
    expect(body.code).toBe("PROJECT_HAS_SOLID_CONTROL");
    expect((await call("GET", `/projects/${projectId}`)).status).toBe(200);
  });
});

import { beforeEach, describe, expect, test } from "bun:test";
import {
  call,
  createDailyReport,
  createProject,
  createSection,
  createWell,
  MISSING_ID,
  resetDb,
} from "../../test/helpers";

// Two projects, one well and one section each, so a filter has something to leave out.
let alpha: { projectId: string; wellId: string; sectionId: string };
let beta: { projectId: string; wellId: string; sectionId: string };

async function setUpProject(name: string) {
  const projectId = (await createProject({ name })).id;
  const wellId = (await createWell(projectId)).id;
  const sectionId = (await createSection(wellId)).id;
  return { projectId, wellId, sectionId };
}

beforeEach(async () => {
  await resetDb();
  alpha = await setUpProject("Alpha");
  beta = await setUpProject("Beta");
});

describe("GET /daily-reports", () => {
  test("lists the reports of every project when no project is requested", async () => {
    await createDailyReport(alpha.wellId, alpha.sectionId);
    await createDailyReport(beta.wellId, beta.sectionId);

    const { body } = await call("GET", "/daily-reports");

    expect(body.data).toHaveLength(2);
    expect(body.meta.total).toBe(2);
  });

  test("lists only the reports of the requested project and counts only those", async () => {
    const mine = await createDailyReport(alpha.wellId, alpha.sectionId);
    await createDailyReport(beta.wellId, beta.sectionId);

    const { body } = await call(
      "GET",
      `/daily-reports?project_id=${alpha.projectId}`,
    );

    expect(body.data.map((r: { id: string }) => r.id)).toEqual([mine.id]);
    expect(body.meta.total).toBe(1);
  });

  test("pages the reports of one project with the right total", async () => {
    for (const day of ["01", "02", "03"]) {
      await createDailyReport(alpha.wellId, alpha.sectionId, {
        report_date: `2026-03-${day}`,
      });
    }
    await createDailyReport(beta.wellId, beta.sectionId);

    const { body } = await call(
      "GET",
      `/daily-reports?project_id=${alpha.projectId}&page=2&pageSize=2`,
    );

    expect(body.data).toHaveLength(1);
    expect(body.meta).toEqual({ page: 2, pageSize: 2, total: 3 });
  });

  test("returns nothing when the well is not in the requested project", async () => {
    await createDailyReport(alpha.wellId, alpha.sectionId);

    const { status, body } = await call(
      "GET",
      `/daily-reports?project_id=${beta.projectId}&well_id=${alpha.wellId}`,
    );

    expect(status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.meta.total).toBe(0);
  });

  test("returns an empty page for an unknown project", async () => {
    await createDailyReport(alpha.wellId, alpha.sectionId);

    const { status, body } = await call(
      "GET",
      `/daily-reports?project_id=${MISSING_ID}`,
    );

    expect(status).toBe(200);
    expect(body.data).toEqual([]);
  });

  test("rejects a project id that is not a uuid with 422", async () => {
    const { status } = await call("GET", "/daily-reports?project_id=nope");

    expect(status).toBe(422);
  });
});

describe("POST /daily-reports", () => {
  test("creates a report with its well and section, numbered 1", async () => {
    const { status, body } = await call("POST", "/daily-reports", {
      well_id: alpha.wellId,
      section_id: alpha.sectionId,
      report_date: "2026-03-01",
      bit_depth_m: 1250.5,
    });

    expect(status).toBe(201);
    expect(body.data).toMatchObject({
      well_id: alpha.wellId,
      section_id: alpha.sectionId,
      report_no: 1,
      report_date: "2026-03-01",
      bit_depth_m: 1250.5,
      bit_td_m: null,
    });
    expect(body.data).not.toHaveProperty("created_by");
  });

  test("numbers the next report of a well after the highest one", async () => {
    await createDailyReport(alpha.wellId, alpha.sectionId, {
      report_date: "2026-03-01",
      report_no: 7,
    });

    const next = await createDailyReport(alpha.wellId, alpha.sectionId, {
      report_date: "2026-03-02",
    });
    const otherWell = await createDailyReport(beta.wellId, beta.sectionId);

    expect(next.report_no).toBe(8);
    expect(otherWell.report_no).toBe(1); // numbers are per well
  });

  test("rejects a second report on the same date of a well with 409", async () => {
    await createDailyReport(alpha.wellId, alpha.sectionId, {
      report_date: "2026-03-01",
    });

    const { status, body } = await call("POST", "/daily-reports", {
      well_id: alpha.wellId,
      section_id: alpha.sectionId,
      report_date: "2026-03-01",
    });

    expect(status).toBe(409);
    expect(body.code).toBe("DAILY_REPORT_DATE_TAKEN");
  });

  test("rejects a number that the well already uses with 409", async () => {
    await createDailyReport(alpha.wellId, alpha.sectionId, {
      report_date: "2026-03-01",
      report_no: 3,
    });

    const { status, body } = await call("POST", "/daily-reports", {
      well_id: alpha.wellId,
      section_id: alpha.sectionId,
      report_date: "2026-03-02",
      report_no: 3,
    });

    expect(status).toBe(409);
    expect(body.code).toBe("DAILY_REPORT_NUMBER_TAKEN");
  });

  test("rejects a section of another well with 400", async () => {
    const { status, body } = await call("POST", "/daily-reports", {
      well_id: alpha.wellId,
      section_id: beta.sectionId,
      report_date: "2026-03-01",
    });

    expect(status).toBe(400);
    expect(body.code).toBe("SECTION_NOT_IN_WELL");
  });

  test("returns 404 for an unknown well", async () => {
    const { status } = await call("POST", "/daily-reports", {
      well_id: MISSING_ID,
      section_id: alpha.sectionId,
      report_date: "2026-03-01",
    });

    expect(status).toBe(404);
  });

  test("rejects a bad date, a negative depth and a bad number with 422", async () => {
    const { status, body } = await call("POST", "/daily-reports", {
      well_id: alpha.wellId,
      section_id: alpha.sectionId,
      report_date: "01/03/2026",
      bit_depth_m: -1,
      report_no: 0,
    });

    expect(status).toBe(422);
    expect(body.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe("GET, PATCH and DELETE /daily-reports/:id", () => {
  test("gets one report with its well and section", async () => {
    const report = await createDailyReport(alpha.wellId, alpha.sectionId);

    const { status, body } = await call("GET", `/daily-reports/${report.id}`);

    expect(status).toBe(200);
    expect(body.data.id).toBe(report.id);
    expect(body.data.section_hole_size).toBe(12.25);
  });

  test("changes the depths and can clear one with null", async () => {
    const report = await createDailyReport(alpha.wellId, alpha.sectionId, {
      bit_depth_m: 100,
    });

    const { status, body } = await call(
      "PATCH",
      `/daily-reports/${report.id}`,
      {
        bit_td_m: 300,
        bit_depth_m: null,
      },
    );

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ bit_td_m: 300, bit_depth_m: null });
  });

  test("moving a report to a section of another well is refused with 400", async () => {
    const report = await createDailyReport(alpha.wellId, alpha.sectionId);

    const { status, body } = await call(
      "PATCH",
      `/daily-reports/${report.id}`,
      {
        section_id: beta.sectionId,
      },
    );

    expect(status).toBe(400);
    expect(body.code).toBe("SECTION_NOT_IN_WELL");
  });

  test("rejects an empty patch with 422", async () => {
    const report = await createDailyReport(alpha.wellId, alpha.sectionId);

    const { status } = await call("PATCH", `/daily-reports/${report.id}`, {});

    expect(status).toBe(422);
  });

  test("deletes a report; it is then gone", async () => {
    const report = await createDailyReport(alpha.wellId, alpha.sectionId);

    const deleted = await call("DELETE", `/daily-reports/${report.id}`);
    const after = await call("GET", `/daily-reports/${report.id}`);

    expect(deleted.status).toBe(204);
    expect(after.status).toBe(404);
  });

  test("returns 404 for an unknown id on every method", async () => {
    const path = `/daily-reports/${MISSING_ID}`;

    expect((await call("GET", path)).status).toBe(404);
    expect((await call("PATCH", path, { bit_td_m: 1 })).status).toBe(404);
    expect((await call("DELETE", path)).status).toBe(404);
  });
});

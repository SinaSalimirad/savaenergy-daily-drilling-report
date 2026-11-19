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

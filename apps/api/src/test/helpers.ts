import { sql } from "drizzle-orm";
import { app } from "../app";
import { db } from "../db";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

/** Result of one request. `body` is `undefined` for an empty response such as 204. */
export type ApiResponse = {
  status: number;
  // The shape depends on the route, and each test asserts the parts it needs.
  // biome-ignore lint/suspicious/noExplicitAny: test helper, the body is checked by the assertions.
  body: any;
};

/** Sends a request straight to the app. No port is opened. */
export async function call(
  method: Method,
  path: string,
  body?: unknown,
): Promise<ApiResponse> {
  const response = await app.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: body === undefined ? {} : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : undefined };
}

/** Empties every table. Call it in `beforeEach` so tests do not depend on each other. */
export async function resetDb(): Promise<void> {
  await db.execute(
    sql`truncate table sections, wells, projects restart identity cascade`,
  );
}

let counter = 0;

export const projectPayload = (overrides: Record<string, unknown> = {}) => ({
  name: `Project ${++counter}`,
  operator: "Operator Co",
  contractor: "Contractor Co",
  field: "South Field",
  wells: 3,
  currency: "USD",
  ...overrides,
});

export const wellPayload = (
  projectId: string,
  overrides: Record<string, unknown> = {},
) => ({
  project_id: projectId,
  name: `Well ${++counter}`,
  status: "planned",
  rig_name: "Rig 1",
  rig_type: "onshore",
  ...overrides,
});

export async function createProject(overrides: Record<string, unknown> = {}) {
  const { status, body } = await call(
    "POST",
    "/projects",
    projectPayload(overrides),
  );
  if (status !== 201) throw new Error(`Could not create a project: ${status}`);
  return body.data;
}

export async function createWell(
  projectId: string,
  overrides: Record<string, unknown> = {},
) {
  const { status, body } = await call(
    "POST",
    "/wells",
    wellPayload(projectId, overrides),
  );
  if (status !== 201) throw new Error(`Could not create a well: ${status}`);
  return body.data;
}

export const sectionPayload = (
  wellId: string,
  overrides: Record<string, unknown> = {},
) => ({ well_id: wellId, hole_size: 12.25, ...overrides });

export async function createSection(
  wellId: string,
  overrides: Record<string, unknown> = {},
) {
  const { status, body } = await call(
    "POST",
    "/sections",
    sectionPayload(wellId, overrides),
  );
  if (status !== 201) throw new Error(`Could not create a section: ${status}`);
  return body.data;
}

export async function createDailyReport(
  wellId: string,
  sectionId: string,
  overrides: Record<string, unknown> = {},
) {
  const { status, body } = await call("POST", "/daily-reports", {
    well_id: wellId,
    section_id: sectionId,
    report_date: "2026-03-01",
    ...overrides,
  });
  if (status !== 201) {
    throw new Error(`Could not create a daily report: ${status}`);
  }
  return body.data;
}

export const MISSING_ID = "00000000-0000-4000-8000-000000000000";

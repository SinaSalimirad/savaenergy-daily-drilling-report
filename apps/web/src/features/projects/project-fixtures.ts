import type { Project } from "./api";

// A valid project with every required field. Tests override only what they care about.
export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "project-1",
    name: "North Sea Campaign",
    operator: "Sava Energy",
    contractor: "Drill Co",
    field: "Alpha",
    status: "active",
    currency: "USD",
    archived_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeProjectsPage(projects: Project[], total = projects.length) {
  return { data: projects, meta: { total, page: 1, pageSize: 10 } };
}

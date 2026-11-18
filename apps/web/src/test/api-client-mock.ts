import { mock } from "bun:test";

// Stands in for the Eden client. Only what the tests exercise is implemented.
//
// `mock.module` replaces the module for the whole test run, not one file, so every test
// file shares this single mock. It is registered from the preload (`setup.ts`): Bun links
// a test file's static imports before running any of its code, so a `mock.module` call
// inside the test file would come too late for `api.ts`.
export const listProjects = mock();
export const archiveProject = mock();
export const restoreProject = mock();
export const projectById = mock((_: { id: string }) => ({
  archive: { post: archiveProject },
  restore: { post: restoreProject },
}));

mock.module("@/lib/api-client", () => ({
  api: { projects: Object.assign(projectById, { get: listProjects }) },
}));

export function resetApiClientMock() {
  listProjects.mockReset();
  archiveProject.mockReset();
  restoreProject.mockReset();
  projectById.mockClear();
}

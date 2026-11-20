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
export const updateProject = mock();
export const deleteProject = mock();
export const projectById = mock((_: { id: string }) => ({
  archive: { post: archiveProject },
  restore: { post: restoreProject },
  patch: updateProject,
  delete: deleteProject,
}));

export const moveSection = mock();
export const sectionById = mock((_: { id: string }) => ({
  move: { post: moveSection },
}));

export const listWells = mock();
export const listDailyReports = mock();
export const listProducts = mock();

export const listProjectProducts = mock();
export const addProjectProduct = mock();
export const updateProjectProduct = mock();
export const removeProjectProduct = mock();
export const projectProductById = mock((_: { id: string }) => ({
  patch: updateProjectProduct,
  delete: removeProjectProduct,
}));

export const listInventory = mock();
export const createInventory = mock();
export const updateInventory = mock();
export const deleteInventory = mock();
export const inventoryById = mock((_: { id: string }) => ({
  patch: updateInventory,
  delete: deleteInventory,
}));

mock.module("@/lib/api-client", () => ({
  api: {
    projects: Object.assign(projectById, { get: listProjects }),
    sections: Object.assign(sectionById, { get: mock() }),
    wells: { get: listWells },
    "daily-reports": { get: listDailyReports },
    products: { get: listProducts },
    "project-products": Object.assign(projectProductById, {
      get: listProjectProducts,
      post: addProjectProduct,
    }),
    inventory: Object.assign(inventoryById, {
      get: listInventory,
      post: createInventory,
    }),
  },
}));

export function resetApiClientMock() {
  listProjects.mockReset();
  archiveProject.mockReset();
  restoreProject.mockReset();
  updateProject.mockReset();
  deleteProject.mockReset();
  projectById.mockClear();
  moveSection.mockReset();
  sectionById.mockClear();
  for (const fn of [
    listWells,
    listDailyReports,
    listProducts,
    listProjectProducts,
    addProjectProduct,
    updateProjectProduct,
    removeProjectProduct,
    projectProductById,
    listInventory,
    createInventory,
    updateInventory,
    deleteInventory,
    inventoryById,
  ]) {
    fn.mockReset();
  }
  // `mockReset` also drops the implementations of the "by id" helpers: put them back.
  projectProductById.mockImplementation(() => ({
    patch: updateProjectProduct,
    delete: removeProjectProduct,
  }));
  inventoryById.mockImplementation(() => ({
    patch: updateInventory,
    delete: deleteInventory,
  }));
}

import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import {
  archiveProject,
  listProjects,
  projectById,
  resetApiClientMock,
  restoreProject,
} from "@/test/api-client-mock";
import {
  QueryWrapper,
  resetTestQueryClient,
  testQueryClient,
} from "@/test/query-wrapper";
import { useArchiveProject, useProjects, useRestoreProject } from "./api";
import { projectKeys } from "./query-keys";

const emptyPage = { data: [], meta: { total: 0, page: 1, pageSize: 10 } };

beforeEach(() => {
  resetTestQueryClient();
  mock.restore();
  resetApiClientMock();
});

describe("useProjects", () => {
  it("asks the API for the active list with archived=false as text", async () => {
    listProjects.mockResolvedValue({ data: emptyPage, error: null });

    const { result } = renderHook(
      () => useProjects({ page: 3, pageSize: 10, archived: false }),
      { wrapper: QueryWrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // The API reads the flag from the URL, where every value is text.
    expect(listProjects).toHaveBeenCalledWith({
      query: { page: 3, pageSize: 10, archived: "false" },
    });
  });

  it("asks the API for the archived list with archived=true as text", async () => {
    listProjects.mockResolvedValue({ data: emptyPage, error: null });

    const { result } = renderHook(
      () => useProjects({ page: 1, pageSize: 1, archived: true }),
      { wrapper: QueryWrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(listProjects).toHaveBeenCalledWith({
      query: { page: 1, pageSize: 1, archived: "true" },
    });
  });

  it("turns an API error response into a failed query with the API's message", async () => {
    listProjects.mockResolvedValue({
      data: null,
      error: {
        status: 500,
        value: { code: "INTERNAL_ERROR", message: "Database is down" },
      },
    });

    const { result } = renderHook(
      () => useProjects({ page: 1, pageSize: 10, archived: false }),
      { wrapper: QueryWrapper },
    );
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe("Database is down");
  });
});

describe("project mutations", () => {
  it("archives the project with the given id", async () => {
    archiveProject.mockResolvedValue({ data: { id: "p1" }, error: null });
    const { result } = renderHook(() => useArchiveProject(), {
      wrapper: QueryWrapper,
    });

    await result.current.mutateAsync("p1");

    expect(projectById).toHaveBeenCalledWith({ id: "p1" });
    expect(archiveProject).toHaveBeenCalledTimes(1);
  });

  it("restores the project with the given id", async () => {
    restoreProject.mockResolvedValue({ data: { id: "p1" }, error: null });
    const { result } = renderHook(() => useRestoreProject(), {
      wrapper: QueryWrapper,
    });

    await result.current.mutateAsync("p1");

    expect(projectById).toHaveBeenCalledWith({ id: "p1" });
    expect(restoreProject).toHaveBeenCalledTimes(1);
  });

  it("refreshes every project list after a successful change", async () => {
    archiveProject.mockResolvedValue({ data: { id: "p1" }, error: null });
    const invalidate = spyOn(testQueryClient, "invalidateQueries");
    const { result } = renderHook(() => useArchiveProject(), {
      wrapper: QueryWrapper,
    });

    await result.current.mutateAsync("p1");

    expect(invalidate).toHaveBeenCalledWith({ queryKey: projectKeys.all });
  });

  it("does not refresh the lists when the change fails", async () => {
    archiveProject.mockResolvedValue({
      data: null,
      error: {
        status: 404,
        value: { code: "NOT_FOUND", message: "Project not found" },
      },
    });
    const invalidate = spyOn(testQueryClient, "invalidateQueries");
    const { result } = renderHook(() => useArchiveProject(), {
      wrapper: QueryWrapper,
    });

    await expect(result.current.mutateAsync("p1")).rejects.toThrow(
      "Project not found",
    );

    expect(invalidate).not.toHaveBeenCalled();
  });
});

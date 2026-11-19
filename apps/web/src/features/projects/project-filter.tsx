"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const PROJECT_FILTER_STORAGE_KEY = "selected-project-id";

type ProjectFilter = {
  // `null` means "all projects".
  projectId: string | null;
  setProjectId: (projectId: string | null) => void;
};

const ProjectFilterContext = createContext<ProjectFilter | null>(null);

// Browser storage can throw (private window, blocked site data), and the filter must still work.
function readStoredProjectId() {
  try {
    return localStorage.getItem(PROJECT_FILTER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeProjectId(projectId: string | null) {
  try {
    if (projectId === null) localStorage.removeItem(PROJECT_FILTER_STORAGE_KEY);
    else localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, projectId);
  } catch {
    // Not saved: the filter then lasts until the page is reloaded.
  }
}

/** Holds the project every page is filtered by. It lives in the layout, so it survives navigation. */
export function ProjectFilterProvider({ children }: { children: ReactNode }) {
  const [projectId, setProjectIdState] = useState<string | null>(null);

  // Read after mount: the server has no localStorage, and reading it during the first render
  // would make the browser's HTML differ from the server's.
  useEffect(() => {
    setProjectIdState(readStoredProjectId());
  }, []);

  const setProjectId = useCallback((next: string | null) => {
    setProjectIdState(next);
    storeProjectId(next);
  }, []);

  const value = useMemo(
    () => ({ projectId, setProjectId }),
    [projectId, setProjectId],
  );

  return (
    <ProjectFilterContext.Provider value={value}>
      {children}
    </ProjectFilterContext.Provider>
  );
}

/** The selected project id (`null` = all projects) and a setter. */
export function useProjectFilter() {
  const context = useContext(ProjectFilterContext);
  if (!context) {
    throw new Error(
      "useProjectFilter must be used inside ProjectFilterProvider",
    );
  }
  return context;
}

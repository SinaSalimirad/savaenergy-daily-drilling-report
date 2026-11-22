export const drillStringToolKeys = {
  all: ["drill-string"] as const,
  parent: (parentId: string) => [...drillStringToolKeys.all, parentId] as const,
};

export const bitKeys = {
  all: ["bits"] as const,
  parent: (parentId: string) => [...bitKeys.all, parentId] as const,
};

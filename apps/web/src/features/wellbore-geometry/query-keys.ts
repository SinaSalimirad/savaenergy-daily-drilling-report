export const wellboreIntervalKeys = {
  all: ["wellbore-intervals"] as const,
  parent: (parentId: string) =>
    [...wellboreIntervalKeys.all, parentId] as const,
};

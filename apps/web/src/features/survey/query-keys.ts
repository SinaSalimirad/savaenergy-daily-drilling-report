export const surveyStationKeys = {
  all: ["survey"] as const,
  parent: (parentId: string) => [...surveyStationKeys.all, parentId] as const,
};

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ensureOk, unwrap } from "@/lib/api-error";
import { type SampleBody, typedBody } from "../fluid-samples/fields";
import { surveyStationKeys } from "./query-keys";

async function fetchSurveyStations(parentId: string) {
  return unwrap(await api.survey.get({ query: { well_id: parentId } }));
}

// Types come from the API through Eden, so a change there breaks this file's typecheck.
// Every computed number is made by the server; the web only displays them.
export type SurveyStationsResponse = Awaited<
  ReturnType<typeof fetchSurveyStations>
>;
export type SurveyStation = SurveyStationsResponse["data"][number];
type CreateSurveyStationBody = Parameters<(typeof api)["survey"]["post"]>[0];
type UpdateSurveyStationBody = NonNullable<
  Parameters<ReturnType<(typeof api)["survey"]>["patch"]>[0]
>;

export function surveyStationQueryOptions(parentId: string) {
  return queryOptions({
    queryKey: surveyStationKeys.parent(parentId),
    queryFn: () => fetchSurveyStations(parentId),
  });
}

/** The survey stations of one well. With `null`, nothing is fetched. */
export function useSurveyStations(parentId: string | null) {
  return useQuery({
    ...surveyStationQueryOptions(parentId ?? ""),
    enabled: parentId !== null,
  });
}

function useSurveyStationMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    // The pressure loss and the hole cleaning read these rows: they must be fetched again.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: surveyStationKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["hydraulics"] }),
      ]),
  });
}

export function useCreateSurveyStation() {
  return useSurveyStationMutation(async (body: SampleBody) =>
    unwrap(await api.survey.post(typedBody<CreateSurveyStationBody>(body))),
  );
}

export function useUpdateSurveyStation() {
  return useSurveyStationMutation(
    async ({ id, body }: { id: string; body: SampleBody }) =>
      unwrap(
        await api
          .survey({ id })
          .patch(typedBody<UpdateSurveyStationBody>(body)),
      ),
  );
}

export function useDeleteSurveyStation() {
  return useSurveyStationMutation(async (id: string) =>
    ensureOk(await api.survey({ id }).delete()),
  );
}

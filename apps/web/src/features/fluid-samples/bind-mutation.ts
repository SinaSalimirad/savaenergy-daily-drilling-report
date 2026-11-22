import type { SampleMutation } from "./components/sample-dialogs";

/**
 * Fits a mutation that needs more than the form's body (the id of the sample, say) to what
 * the dialogs expect: `toVariables` adds the rest.
 */
export function bindMutation<TVariables, TBody>(
  mutation: SampleMutation<TVariables>,
  toVariables: (body: TBody) => TVariables,
): SampleMutation<TBody> {
  return {
    mutate: (body, options) => mutation.mutate(toVariables(body), options),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

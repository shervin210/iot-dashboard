import { useCallback, useState } from "react";
import { ApiError } from "../api/httpClient.js";

export interface UseMutationResult<TArgs extends unknown[], TResult> {
  mutate: (...args: TArgs) => Promise<TResult | undefined>;
  loading: boolean;
  error: ApiError | null;
}

export function useMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
): UseMutationResult<TArgs, TResult> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        setLoading(false);
        return result;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError("Unexpected error");
        setError(apiError);
        setLoading(false);
        return undefined;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn]
  );

  return { mutate, loading, error };
}

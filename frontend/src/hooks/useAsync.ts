import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../api/httpClient.js";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export interface UseAsyncResult<T> extends AsyncState<T> {
  refetch: () => void;
}
export function useAsync<T>(factory: () => Promise<T>, deps: ReadonlyArray<unknown>): UseAsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const requestId = useRef(0);

  const run = useCallback(() => {
    const id = ++requestId.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    factory()
      .then((data) => {
        if (id === requestId.current) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (id === requestId.current) {
          const apiError = error instanceof ApiError ? error : new ApiError("Unexpected error");
          setState({ data: null, loading: false, error: apiError });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, refetch: run };
}

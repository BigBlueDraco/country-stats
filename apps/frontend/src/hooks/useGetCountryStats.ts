import { useState, useEffect, useCallback } from "react";
import type { CountryStatsResponse, ApiError } from "../types";
import { countryStatsService } from "../services";

interface UseCountryStatsState {
  data: CountryStatsResponse | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseCountryStatsReturn extends UseCountryStatsState {
  refetch: () => Promise<void>;
}

export function useGetCountryStats(): UseCountryStatsReturn {
  const [state, setState] = useState<UseCountryStatsState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchCountryStats = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await countryStatsService.getCountryStats();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as ApiError,
      });
    }
  }, []);

  useEffect(() => {
    fetchCountryStats();
  }, [fetchCountryStats]);

  return {
    ...state,
    refetch: fetchCountryStats,
  };
}

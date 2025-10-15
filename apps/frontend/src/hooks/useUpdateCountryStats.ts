import { useCallback, useEffect, useRef } from "react";
import { countryStatsService } from "../services";

export function useUpdateCountryStats(): void {
  const hasExecuted = useRef(false);

  const updateCountryStats = useCallback(async () => {
    if (hasExecuted.current) return;

    hasExecuted.current = true;

    try {
      await countryStatsService.updateCountryStats();
    } catch (error) {
      console.error("Failed to update country stats:", error);
      hasExecuted.current = false;
    }
  }, []);

  useEffect(() => {
    updateCountryStats();
  }, [updateCountryStats]);
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUpdateCountryStats } from "./useUpdateCountryStats";
import { countryStatsService } from "../services";
vi.mock("../services", () => ({
  countryStatsService: {
    updateCountryStats: vi.fn(),
  },
}));

const mockedService = vi.mocked(countryStatsService);

describe("useUpdateCountryStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls updateCountryStats service on mount", async () => {
    mockedService.updateCountryStats.mockResolvedValue();

    renderHook(() => useUpdateCountryStats());
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockedService.updateCountryStats).toHaveBeenCalledTimes(1);
  });

  it("handles service errors gracefully", async () => {
    const mockError = new Error("Service unavailable");
    mockedService.updateCountryStats.mockRejectedValue(mockError);
    expect(() => {
      renderHook(() => useUpdateCountryStats());
    }).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockedService.updateCountryStats).toHaveBeenCalledTimes(1);
  });

  it("does not make multiple calls from the same hook instance", async () => {
    mockedService.updateCountryStats.mockResolvedValue();

    const { rerender } = renderHook(() => useUpdateCountryStats());
    await new Promise((resolve) => setTimeout(resolve, 10));
    rerender();
    rerender();
    rerender();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockedService.updateCountryStats).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGetCountryStats } from "./useGetCountryStats";
import { countryStatsService } from "../services";
import type { CountryStatsResponse, ApiError } from "../types";
vi.mock("../services", () => ({
  countryStatsService: {
    getCountryStats: vi.fn(),
  },
}));

const mockedService = vi.mocked(countryStatsService);

describe("useGetCountryStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with loading state", () => {
    mockedService.getCountryStats.mockImplementation(
      () => new Promise(() => {})
    );

    const { result } = renderHook(() => useGetCountryStats());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.refetch).toBe("function");
  });

  it("successfully fetches and sets data", async () => {
    const mockData: CountryStatsResponse = {
      US: 1500,
      CA: 800,
      GB: 1200,
    };

    mockedService.getCountryStats.mockResolvedValue(mockData);

    const { result } = renderHook(() => useGetCountryStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(mockedService.getCountryStats).toHaveBeenCalledTimes(1);
  });

  it("handles API errors correctly", async () => {
    const mockError: ApiError = {
      message: "Server error",
      status: 500,
      code: "INTERNAL_ERROR",
    };

    mockedService.getCountryStats.mockRejectedValue(mockError);

    const { result } = renderHook(() => useGetCountryStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toEqual(mockError);
    expect(mockedService.getCountryStats).toHaveBeenCalledTimes(1);
  });

  it("refetch function calls service again", async () => {
    const mockData: CountryStatsResponse = { US: 1000 };
    mockedService.getCountryStats.mockResolvedValue(mockData);

    const { result } = renderHook(() => useGetCountryStats());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    mockedService.getCountryStats.mockClear();
    await result.current.refetch();

    expect(mockedService.getCountryStats).toHaveBeenCalledTimes(1);
  });

  it("clears previous error on successful refetch", async () => {

    const mockError: ApiError = { message: "Network error", status: 500 };
    mockedService.getCountryStats.mockRejectedValue(mockError);

    const { result } = renderHook(() => useGetCountryStats());

    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });
    const mockData: CountryStatsResponse = { US: 1000 };
    mockedService.getCountryStats.mockResolvedValue(mockData);

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.error).toBe(null);
      expect(result.current.data).toEqual(mockData);
    });
  });
});

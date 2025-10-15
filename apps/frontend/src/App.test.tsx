import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "./test/test-utils";
import App from "./App";
import { countryStatsService } from "./services";
import type { CountryStatsResponse } from "./types";
vi.mock("./services", () => ({
  countryStatsService: {
    getCountryStats: vi.fn(),
    updateCountryStats: vi.fn(),
  },
}));

const mockedService = vi.mocked(countryStatsService);

describe("App Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", async () => {

    mockedService.getCountryStats.mockImplementation(
      () => new Promise(() => {})
    );
    mockedService.updateCountryStats.mockResolvedValue();

    render(<App />);

    expect(
      screen.getByText("Country Statistics Dashboard")
    ).toBeInTheDocument();
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  it("renders country data when loaded successfully", async () => {
    const mockData: CountryStatsResponse = {
      US: 1500,
      CA: 800,
      GB: 1200,
    };

    mockedService.getCountryStats.mockResolvedValue(mockData);
    mockedService.updateCountryStats.mockResolvedValue();

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText("Loading data...")).not.toBeInTheDocument();
    });
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Country Code")).toBeInTheDocument();
    expect(screen.getByText("Visitors")).toBeInTheDocument();
    expect(screen.getByText("US")).toBeInTheDocument();
    expect(screen.getByText("1,500")).toBeInTheDocument();
  });

  it("renders error state when data fetch fails", async () => {
    const mockError = {
      message: "Failed to fetch data",
      status: 500,
    };

    mockedService.getCountryStats.mockRejectedValue(mockError);
    mockedService.updateCountryStats.mockResolvedValue();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText("Failed to fetch data")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });

  it("handles retry functionality", async () => {
    const mockError = {
      message: "Network error",
      status: 500,
    };

    const mockData: CountryStatsResponse = {
      US: 1000,
    };
    mockedService.getCountryStats
      .mockRejectedValueOnce(mockError)
      .mockResolvedValue(mockData);
    mockedService.updateCountryStats.mockResolvedValue();

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    expect(screen.getByText("US")).toBeInTheDocument();
    expect(screen.getByText("1,000")).toBeInTheDocument();
    expect(mockedService.getCountryStats).toHaveBeenCalledTimes(2);
  });

  it("calls updateCountryStats service on mount", () => {
    mockedService.getCountryStats.mockImplementation(
      () => new Promise(() => {})
    );
    mockedService.updateCountryStats.mockResolvedValue();

    render(<App />);

    expect(mockedService.updateCountryStats).toHaveBeenCalledTimes(1);
  });

  it("has proper app structure and layout", async () => {
    const mockData: CountryStatsResponse = { US: 1000 };
    mockedService.getCountryStats.mockResolvedValue(mockData);
    mockedService.updateCountryStats.mockResolvedValue();

    render(<App />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByText("Country Statistics Dashboard")
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("main")).toBeInTheDocument();
    });
  });

  it("renders empty state when no data is available", async () => {
    mockedService.getCountryStats.mockResolvedValue({});
    mockedService.updateCountryStats.mockResolvedValue();

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText("No country statistics available")
      ).toBeInTheDocument();
    });
  });

  it("does not render table and error simultaneously", async () => {
    const mockData: CountryStatsResponse = { US: 1000 };
    mockedService.getCountryStats.mockResolvedValue(mockData);
    mockedService.updateCountryStats.mockResolvedValue();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();
  });

  it("shows loading spinner", () => {
    mockedService.getCountryStats.mockImplementation(
      () => new Promise(() => {})
    );
    mockedService.updateCountryStats.mockResolvedValue();

    render(<App />);

    const loadingSpinner = screen.getByRole("progressbar");
    expect(loadingSpinner).toBeInTheDocument();
  });
});

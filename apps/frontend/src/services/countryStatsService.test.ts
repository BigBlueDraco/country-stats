import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CountryStatsResponse } from "../types";

// Mock axios module
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    })),
  },
}));

describe("countryStatsService", () => {
  let mockAxiosInstance: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Get fresh axios mock
    const axios = (await import("axios")).default;

    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    };

    // Mock axios.create
    (axios.create as any).mockReturnValue(mockAxiosInstance);
  });

  describe("service setup", () => {
    it("exports service functions", async () => {
      const { countryStatsService } = await import("./countryStatsService");

      expect(typeof countryStatsService.getCountryStats).toBe("function");
      expect(typeof countryStatsService.updateCountryStats).toBe("function");
    });

    it("creates axios instance with correct configuration", async () => {
      const axios = (await import("axios")).default;
      await import("./countryStatsService");

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: "http://localhost:8000/api", // Set from test env
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  });

  describe("getCountryStats", () => {
    it("successfully fetches country statistics", async () => {
      const mockData: CountryStatsResponse = {
        US: 1500,
        CA: 800,
        GB: 1200,
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockData });

      const { countryStatsService } = await import("./countryStatsService");
      const result = await countryStatsService.getCountryStats();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/country-stats");
      expect(result).toEqual(mockData);
    });

    it("handles network errors correctly", async () => {
      const networkError = {
        message: "Network Error",
        code: "ERR_NETWORK",
        status: undefined,
      };

      mockAxiosInstance.get.mockRejectedValue(networkError);

      const { countryStatsService } = await import("./countryStatsService");

      await expect(countryStatsService.getCountryStats()).rejects.toMatchObject(
        {
          message: "Network Error",
          code: "ERR_NETWORK",
        }
      );
    });

    it("logs errors to console", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Test error");
      mockAxiosInstance.get.mockRejectedValue(error);

      const { countryStatsService } = await import("./countryStatsService");

      try {
        await countryStatsService.getCountryStats();
      } catch {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch country stats:",
        error
      );
      consoleSpy.mockRestore();
    });

    it("handles API response errors", async () => {
      const apiError = {
        message: "Server error occurred",
        status: 500,
        code: "INTERNAL_ERROR",
      };

      mockAxiosInstance.get.mockRejectedValue(apiError);

      const { countryStatsService } = await import("./countryStatsService");

      await expect(countryStatsService.getCountryStats()).rejects.toMatchObject(
        {
          message: "Server error occurred",
          status: 500,
        }
      );
    });
  });

  describe("updateCountryStats", () => {
    it("successfully updates country statistics", async () => {
      mockAxiosInstance.post.mockResolvedValue({});

      const { countryStatsService } = await import("./countryStatsService");
      await countryStatsService.updateCountryStats();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/country-stats");
    });

    it("handles network errors", async () => {
      const networkError = {
        message: "Connection refused",
        code: "ECONNREFUSED",
        status: undefined,
      };

      mockAxiosInstance.post.mockRejectedValue(networkError);

      const { countryStatsService } = await import("./countryStatsService");

      await expect(
        countryStatsService.updateCountryStats()
      ).rejects.toMatchObject({
        message: "Connection refused",
        code: "ECONNREFUSED",
      });
    });

    it("handles API errors", async () => {
      const apiError = {
        message: "Invalid IP address",
        status: 400,
        code: "VALIDATION_ERROR",
      };

      mockAxiosInstance.post.mockRejectedValue(apiError);

      const { countryStatsService } = await import("./countryStatsService");

      await expect(
        countryStatsService.updateCountryStats()
      ).rejects.toMatchObject({
        message: "Invalid IP address",
        status: 400,
      });
    });

    it("logs errors to console", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Test error");
      mockAxiosInstance.post.mockRejectedValue(error);

      const { countryStatsService } = await import("./countryStatsService");

      try {
        await countryStatsService.updateCountryStats();
      } catch {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch country stats:",
        error
      );
      consoleSpy.mockRestore();
    });
  });

  describe("integration scenarios", () => {
    it("handles empty response data gracefully", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: {} });

      const { countryStatsService } = await import("./countryStatsService");
      const result = await countryStatsService.getCountryStats();

      expect(result).toEqual({});
    });

    it("handles null response data", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: null });

      const { countryStatsService } = await import("./countryStatsService");
      const result = await countryStatsService.getCountryStats();

      expect(result).toBe(null);
    });

    it("works with large datasets", async () => {
      const largeDataset: CountryStatsResponse = {};
      for (let i = 0; i < 50; i++) {
        largeDataset[`C${i.toString().padStart(2, "0")}`] = Math.floor(
          Math.random() * 1000
        );
      }

      mockAxiosInstance.get.mockResolvedValue({ data: largeDataset });

      const { countryStatsService } = await import("./countryStatsService");
      const result = await countryStatsService.getCountryStats();

      expect(Object.keys(result)).toHaveLength(50);
      expect(result).toEqual(largeDataset);
    });

    it("handles timeout errors", async () => {
      const timeoutError = {
        message: "Request timeout",
        status: 408,
        code: "TIMEOUT",
      };

      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      const { countryStatsService } = await import("./countryStatsService");

      await expect(countryStatsService.getCountryStats()).rejects.toMatchObject(
        {
          message: "Request timeout",
          status: 408,
        }
      );
    });

    it("handles server unavailable errors", async () => {
      const serverError = {
        message: "Service Unavailable",
        status: 503,
        code: "SERVICE_UNAVAILABLE",
      };

      mockAxiosInstance.get.mockRejectedValue(serverError);

      const { countryStatsService } = await import("./countryStatsService");

      await expect(countryStatsService.getCountryStats()).rejects.toMatchObject(
        {
          message: "Service Unavailable",
          status: 503,
        }
      );
    });
  });

  describe("axios configuration", () => {
    it("uses correct timeout setting", async () => {
      const axios = (await import("axios")).default;
      await import("./countryStatsService");

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 10000,
        })
      );
    });

    it("uses correct content type header", async () => {
      const axios = (await import("axios")).default;
      await import("./countryStatsService");

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    });

    it("uses environment base URL", async () => {
      const axios = (await import("axios")).default;
      await import("./countryStatsService");

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "http://localhost:8000/api", // Set from test environment
        })
      );
    });
  });

  describe("error handling edge cases", () => {
    it("handles malformed error objects", async () => {
      const malformedError = { weird: "error" };

      mockAxiosInstance.get.mockRejectedValue(malformedError);

      const { countryStatsService } = await import("./countryStatsService");

      await expect(countryStatsService.getCountryStats()).rejects.toBeDefined();
    });

    it("handles undefined errors", async () => {
      mockAxiosInstance.get.mockRejectedValue(
        new Error("Undefined error occurred")
      );

      const { countryStatsService } = await import("./countryStatsService");

      await expect(countryStatsService.getCountryStats()).rejects.toBeDefined();
    });

    it("handles string errors", async () => {
      mockAxiosInstance.get.mockRejectedValue("Something went wrong");

      const { countryStatsService } = await import("./countryStatsService");

      await expect(countryStatsService.getCountryStats()).rejects.toBeDefined();
    });
  });
});

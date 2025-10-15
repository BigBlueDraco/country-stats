import axios, { AxiosError } from "axios";
import type { CountryStatsResponse, ApiError } from "../types";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  DEFAULT_ERROR_MESSAGE,
} from "../constants";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      message:
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        DEFAULT_ERROR_MESSAGE,
      status: error.response?.status,
      code: error.code,
    };
    return Promise.reject(apiError);
  }
);

export const countryStatsService = {
  async getCountryStats(): Promise<CountryStatsResponse> {
    console.log(API_BASE_URL);
    try {
      const response = await apiClient.get<CountryStatsResponse>(
        API_ENDPOINTS.COUNTRY_STATS
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch country stats:", error);
      throw error;
    }
  },
  async updateCountryStats(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.COUNTRY_STATS);
    } catch (error) {
      console.error("Failed to fetch country stats:", error);
      throw error;
    }
  },
};

export default countryStatsService;

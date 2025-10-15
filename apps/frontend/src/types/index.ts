export interface CountryStats {
  code: string;
  visitors: number;
}

export interface CountryStatsResponse {
  [countryCode: string]: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export type SortOrder = "asc" | "desc";

export type CountryStatsKeys = keyof CountryStats;

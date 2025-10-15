import { variables } from "../utils/vars";

export const API_BASE_URL = variables.BACKEND_URL;

export const API_ENDPOINTS = {
  COUNTRY_STATS: "/country-stats",
} as const;

export const DEFAULT_ERROR_MESSAGE =
  "Something went wrong. Please try again later.";

export const LOADING_MESSAGE = "Loading data...";

export const TABLE_CONFIG = {
  MIN_WIDTH: 650,
  ARIA_LABEL: "country statistics table",
} as const;

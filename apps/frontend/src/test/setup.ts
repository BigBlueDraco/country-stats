import "@testing-library/jest-dom";
import { vi } from "vitest";

Object.defineProperty(import.meta, "env", {
  value: {
    VITE_BACKEND_URL: "http://localhost:8000/api",
  },
});

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Make vi globally available
(globalThis as any).vi = vi;

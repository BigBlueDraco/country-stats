import { describe, it, expect, vi } from "vitest";
describe("Test Utilities", () => {
  it("should have proper test environment setup", () => {
    expect(import.meta.env.VITE_BACKEND_URL).toBe("http://localhost:8000/api");
  });

  it("should have jsdom environment available", () => {
    expect(document).toBeDefined();
    expect(window).toBeDefined();
  });

  it("should have console methods mocked", () => {
    expect(vi.isMockFunction(console.log)).toBe(true);
    expect(vi.isMockFunction(console.error)).toBe(true);
  });
});

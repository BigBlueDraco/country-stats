import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "../../test/test-utils";
import { ErrorDisplay } from "./ErrorDisplay";
import type { ApiError } from "../../types";

describe("ErrorDisplay", () => {
  it("renders nothing when error is null", () => {
    const { container } = render(<ErrorDisplay error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders string error message", () => {
    const errorMessage = "Network connection failed";
    render(<ErrorDisplay error={errorMessage} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("renders ApiError with status code", () => {
    const apiError: ApiError = {
      message: "Server unavailable",
      status: 503,
      code: "SERVICE_UNAVAILABLE",
    };

    render(<ErrorDisplay error={apiError} />);

    expect(screen.getByText("Error 503")).toBeInTheDocument();
    expect(screen.getByText("Server unavailable")).toBeInTheDocument();
  });

  it("renders generic Error object", () => {
    const error = new Error("Something went wrong");
    render(<ErrorDisplay error={error} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders retry button when showRetry is true and onRetry is provided", () => {
    const mockRetry = vi.fn();
    render(
      <ErrorDisplay error="Test error" onRetry={mockRetry} showRetry={true} />
    );

    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it("does not render retry button when showRetry is false", () => {
    const mockRetry = vi.fn();
    render(
      <ErrorDisplay error="Test error" onRetry={mockRetry} showRetry={false} />
    );

    expect(
      screen.queryByRole("button", { name: /try again/i })
    ).not.toBeInTheDocument();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<ErrorDisplay error="Test error" showRetry={true} />);

    expect(
      screen.queryByRole("button", { name: /try again/i })
    ).not.toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const mockRetry = vi.fn();
    render(
      <ErrorDisplay error="Test error" onRetry={mockRetry} showRetry={true} />
    );

    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("renders with different alert variants", () => {
    render(<ErrorDisplay error="Test error" variant="outlined" />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("MuiAlert-outlinedError");
  });

  it("uses default error message for invalid error objects", () => {
    render(<ErrorDisplay error={{} as Error} />);

    expect(
      screen.getByText("Something went wrong. Please try again later.")
    ).toBeInTheDocument();
  });
});

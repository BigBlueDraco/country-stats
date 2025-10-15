import { describe, it, expect } from "vitest";
import { render, screen } from "../../test/test-utils";
import { LoadingSpinner } from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders with default message and size", () => {
    render(<LoadingSpinner />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    const customMessage = "Loading country statistics...";
    render(<LoadingSpinner message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it("renders with custom size", () => {
    render(<LoadingSpinner size={60} />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();

    expect(progressbar.closest("span")).toHaveStyle({
      width: "60px",
      height: "60px",
    });
  });

  it("displays loading message with correct styling", () => {
    render(<LoadingSpinner />);

    const message = screen.getByText("Loading data...");
    expect(message).toHaveClass("MuiTypography-body1");
  });
});

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "../test/test-utils";
import { CountryStatsTable } from "./CountryStatsTable";
import type { CountryStatsResponse } from "../types";

describe("CountryStatsTable", () => {
  const mockData: CountryStatsResponse = {
    US: 1500,
    CA: 800,
    GB: 1200,
    FR: 950,
  };

  it("renders table with country data", () => {
    render(<CountryStatsTable data={mockData} />);
    expect(screen.getByText("Country Code")).toBeInTheDocument();
    expect(screen.getByText("Visitors")).toBeInTheDocument();
    expect(screen.getByText("US")).toBeInTheDocument();
    expect(screen.getByText("1,500")).toBeInTheDocument();
    expect(screen.getByText("CA")).toBeInTheDocument();
    expect(screen.getByText("800")).toBeInTheDocument();
  });

  it("renders empty state when no data is provided", () => {
    render(<CountryStatsTable data={{}} />);

    expect(
      screen.getByText("No country statistics available")
    ).toBeInTheDocument();
  });

  it("formats visitor numbers with locale string", () => {
    const largeNumberData: CountryStatsResponse = {
      US: 1234567,
      GB: 987654,
    };

    render(<CountryStatsTable data={largeNumberData} />);

    expect(screen.getByText("1,234,567")).toBeInTheDocument();
    expect(screen.getByText("987,654")).toBeInTheDocument();
  });

  it("renders all country data in table", () => {
    render(<CountryStatsTable data={mockData} />);
    expect(screen.getByText("US")).toBeInTheDocument();
    expect(screen.getByText("CA")).toBeInTheDocument();
    expect(screen.getByText("GB")).toBeInTheDocument();
    expect(screen.getByText("FR")).toBeInTheDocument();
    expect(screen.getByText("1,500")).toBeInTheDocument();
    expect(screen.getByText("800")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();
    expect(screen.getByText("950")).toBeInTheDocument();
  });

  it("can sort data by clicking headers", () => {
    render(<CountryStatsTable data={mockData} />);

    const visitorsHeader = screen.getByRole("button", { name: /visitors/i });
    expect(visitorsHeader).toBeInTheDocument();
    fireEvent.click(visitorsHeader);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("indicates sort direction in column headers", () => {
    render(<CountryStatsTable data={mockData} />);

    const visitorsHeader = screen.getByRole("button", { name: /visitors/i });
    fireEvent.click(visitorsHeader);
    expect(screen.getByText("sorted ascending")).toBeInTheDocument();
  });

  it("has correct accessibility attributes", () => {
    render(<CountryStatsTable data={mockData} />);

    const table = screen.getByRole("table");
    expect(table).toHaveAttribute("aria-label", "country statistics table");
    const countryCodeCells = screen.getAllByRole("rowheader");
    expect(countryCodeCells).toHaveLength(4);
  });

  it("renders sticky header", () => {
    render(<CountryStatsTable data={mockData} />);

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
  });

  it("shows sortable column headers", () => {
    render(<CountryStatsTable data={mockData} />);
    expect(
      screen.getByRole("button", { name: /country code/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /visitors/i })
    ).toBeInTheDocument();
  });
});

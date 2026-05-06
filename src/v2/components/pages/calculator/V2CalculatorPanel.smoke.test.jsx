import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, screen } from "@testing-library/react";
import V2CalculatorPanel from "./V2CalculatorPanel";
import { renderWithProviders } from "../../../test-utils";

describe("V2CalculatorPanel — smoke", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the heading, input, dice + token chips, and the resolved command", () => {
    renderWithProviders(<V2CalculatorPanel />);

    expect(screen.getByRole("heading", { name: /Calculator/i })).toBeTruthy();
    expect(screen.getByPlaceholderText(/1d20\+\{PROF\}\+\{STR\}/)).toBeTruthy();

    // At least one quick die chip and one token chip render.
    expect(screen.getByRole("button", { name: /^1d20$/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^STR/ })).toBeTruthy();

    // Default expression resolves into a valid !roll command.
    const output = screen.getByLabelText(/Resolved command/i);
    expect(output.textContent).toContain("!roll");
  });

  it("inserts a die chip into the expression at the end of the input", () => {
    renderWithProviders(<V2CalculatorPanel />);

    const input = screen.getByPlaceholderText(/1d20\+\{PROF\}\+\{STR\}/);
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /^2d6$/ }));

    expect(input.value).toBe("2d6");
  });

  it("clears the expression when Clear is pressed", () => {
    renderWithProviders(<V2CalculatorPanel />);

    const input = screen.getByPlaceholderText(/1d20\+\{PROF\}\+\{STR\}/);
    expect(input.value.length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /^Clear$/ }));
    expect(input.value).toBe("");
  });
});

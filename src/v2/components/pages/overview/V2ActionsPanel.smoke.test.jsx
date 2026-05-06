import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen } from "@testing-library/react";
import V2ActionsPanel from "./V2ActionsPanel";
import { renderWithProviders, stubFetch } from "../../../test-utils";

describe("V2ActionsPanel — smoke", () => {
  beforeEach(() => {
    stubFetch(vi);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the panel heading and the major top-level regions", () => {
    renderWithProviders(<V2ActionsPanel />);

    // Panel header
    expect(
      screen.getByRole("heading", { name: /Actions \/ Spells/i }),
    ).toBeTruthy();

    // Filter tabs (the OptionTabStrip extraction)
    expect(screen.getByRole("tablist", { name: /Action filters/i })).toBeTruthy();

    // Category tabs (the second OptionTabStrip)
    expect(
      screen.getByRole("tablist", { name: /Category focus controls/i }),
    ).toBeTruthy();

    // Metamagic rail (the MetamagicTray extraction)
    expect(
      screen.getByRole("complementary", { name: /Metamagic options/i }),
    ).toBeTruthy();

    // Layout controls (the ActionsLayoutControls extraction)
    expect(screen.getByRole("button", { name: /^Spellbook$/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Export Layout$/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Import Layout$/ })).toBeTruthy();
  });

  it("opens the SpellbookOverlay when the Spellbook button is clicked", () => {
    renderWithProviders(<V2ActionsPanel />);

    // Closed by default — no dialog in the document.
    expect(screen.queryByRole("dialog", { name: /Spellbook/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /^Spellbook$/ }));

    // The SpellbookOverlay subtree (extracted in commit dd0f5d9) renders.
    expect(screen.getByRole("dialog", { name: /Spellbook/i })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: /Spellbook tabs/i })).toBeTruthy();
  });
});

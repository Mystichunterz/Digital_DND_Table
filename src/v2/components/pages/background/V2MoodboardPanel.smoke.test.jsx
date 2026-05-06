import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen } from "@testing-library/react";
import V2MoodboardPanel from "./V2MoodboardPanel";
import { renderWithProviders, stubFetch } from "../../../test-utils";

describe("V2MoodboardPanel — smoke", () => {
  beforeEach(() => {
    stubFetch(vi);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the toolbar, sticker palette, and the empty-state hint", () => {
    renderWithProviders(<V2MoodboardPanel />);

    expect(
      screen.getByRole("heading", { name: /Moodboard/i }),
    ).toBeTruthy();

    // Toolbar buttons
    expect(screen.getByRole("button", { name: /^Add Image$/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Save Snapshot$/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Load…/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Clear$/ })).toBeTruthy();

    // Sticker palette (the StickerPalette extraction).
    const palette = screen.getByLabelText(/Sticker palette/i);
    expect(palette).toBeTruthy();
    // STICKERS has 16 glyphs.
    expect(palette.querySelectorAll("button").length).toBe(16);
  });

  it("opens the SnapshotMenu list when Load… is clicked", () => {
    renderWithProviders(<V2MoodboardPanel />);

    expect(screen.queryByRole("listbox", { name: /Past snapshots/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /^Load…/ }));

    expect(screen.getByRole("listbox", { name: /Past snapshots/i })).toBeTruthy();
  });
});

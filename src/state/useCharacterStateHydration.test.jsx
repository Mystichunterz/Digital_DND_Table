import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCharacterStateHydration } from "./useCharacterStateHydration";
import { PersistenceStatusProvider } from "./PersistenceStatusContext";

const wrapper = ({ children }) => (
  <PersistenceStatusProvider>{children}</PersistenceStatusProvider>
);

const respondWith = (response) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(response)),
  );

describe("useCharacterStateHydration", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("passes the saved state to onHydrate, then reports hydrated", async () => {
    respondWith(
      new Response(JSON.stringify({ health: { currentHp: 12 } }), {
        status: 200,
      }),
    );
    const onHydrate = vi.fn();

    const { result } = renderHook(() => useCharacterStateHydration(onHydrate), {
      wrapper,
    });

    expect(result.current).toBe(false);
    await waitFor(() => expect(result.current).toBe(true));
    expect(onHydrate).toHaveBeenCalledWith({ health: { currentHp: 12 } });
    expect(fetch).toHaveBeenCalledWith("/api/state/default");
  });

  it("reports hydrated without calling onHydrate when nothing is saved", async () => {
    respondWith(new Response("", { status: 404 }));
    const onHydrate = vi.fn();

    const { result } = renderHook(() => useCharacterStateHydration(onHydrate), {
      wrapper,
    });

    await waitFor(() => expect(result.current).toBe(true));
    expect(onHydrate).not.toHaveBeenCalled();
  });

  it("reports hydrated when the server is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))),
    );
    const onHydrate = vi.fn();

    const { result } = renderHook(() => useCharacterStateHydration(onHydrate), {
      wrapper,
    });

    await waitFor(() => expect(result.current).toBe(true));
    expect(onHydrate).not.toHaveBeenCalled();
  });

  it("does not call onHydrate after unmount", async () => {
    let resolve;
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise((r) => (resolve = r))),
    );
    const onHydrate = vi.fn();

    const { unmount } = renderHook(
      () => useCharacterStateHydration(onHydrate),
      { wrapper },
    );
    unmount();
    resolve(new Response(JSON.stringify({ a: 1 }), { status: 200 }));
    await new Promise((r) => setTimeout(r, 0));

    expect(onHydrate).not.toHaveBeenCalled();
  });
});

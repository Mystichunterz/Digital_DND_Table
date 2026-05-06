/* eslint-disable react-refresh/only-export-components */
// Test-only helpers — not subject to fast refresh rules.

import { render } from "@testing-library/react";
import { ConditionsProvider } from "./state/ConditionsContext";
import { CharacterStatsProvider } from "./state/CharacterStatsContext";
import { PersistenceStatusProvider } from "./state/PersistenceStatusContext";

export const AllProviders = ({ children }) => (
  <PersistenceStatusProvider>
    <ConditionsProvider>
      <CharacterStatsProvider>{children}</CharacterStatsProvider>
    </ConditionsProvider>
  </PersistenceStatusProvider>
);

export const renderWithProviders = (ui, options) =>
  render(ui, { wrapper: AllProviders, ...options });

// Stub global fetch so panels that hydrate from /api/state/* don't blow
// up on mount. Returns 404 for state, empty arrays for list endpoints,
// 204 for writes. Tests can override per-call by re-stubbing.
export const stubFetch = (vi) => {
  const handler = (url, init = {}) => {
    const method = (init.method ?? "GET").toUpperCase();
    if (typeof url === "string" && url.includes("/snapshots") && method === "GET") {
      return Promise.resolve(
        new Response(JSON.stringify({ snapshots: [] }), { status: 200 }),
      );
    }
    if (method === "GET") {
      return Promise.resolve(new Response("", { status: 404 }));
    }
    return Promise.resolve(new Response("", { status: 204 }));
  };
  vi.stubGlobal("fetch", vi.fn(handler));
};

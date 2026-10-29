/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Read the same .env as the API server so the proxy follows its port.
  const env = loadEnv(mode, process.cwd(), "");
  const apiPort = env.API_PORT || env.ASSET_MANAGER_PORT || 5180;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      // Inline action/item icons (all <10KB) into the JS bundle so they
      // render at full size on first paint instead of flashing tiny while
      // their HTTP requests resolve.
      assetsInlineLimit: 12288,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            // Action / spell catalogs and the conditions table are
            // chunky static data shared between ActionsPanel and the
            // spellbook overlay. Pulling them into their own chunk
            // keeps the boot path lean and lets the browser cache
            // them across panel reloads.
            "actions-data": [
              "./src/data/actionsCatalog",
              "./src/data/character/spellbookTabs",
              "./src/data/conditionsCatalog",
              "./src/data/actions-manifest.json",
            ],
          },
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: false,
      include: [
        "src/**/*.{test,spec}.{js,jsx}",
        "server/**/*.{test,spec}.mjs",
        "scripts/**/*.{test,spec}.mjs",
      ],
    },
  };
});

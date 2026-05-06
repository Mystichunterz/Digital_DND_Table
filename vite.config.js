/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5180",
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
          // chunky static data shared between V2ActionsPanel and the
          // spellbook overlay. Pulling them into their own chunk
          // keeps the boot path lean and lets the browser cache
          // them across panel reloads.
          "actions-data": [
            "./src/v2/data/actionsCatalog",
            "./src/v2/data/spellbookTabs",
            "./src/v2/data/conditionsCatalog",
            "./src/v2/data/actions-manifest.json",
          ],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    include: ["src/**/*.{test,spec}.{js,jsx}", "scripts/**/*.{test,spec}.mjs"],
  },
});

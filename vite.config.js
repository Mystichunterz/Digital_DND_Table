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
        },
      },
    },
  },
});

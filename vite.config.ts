import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // IMPORTANT: must match the GitHub repo name exactly
  base: "/LabelGenerator/",

  build: {
    // GitHub Pages (main branch + /docs)
    outDir: "docs",
    emptyOutDir: true,

    // Optional but recommended for large bundles
    chunkSizeWarningLimit: 1500,
  },

  // Optional: helps with local dev consistency
  server: {
    open: true,
  },
});

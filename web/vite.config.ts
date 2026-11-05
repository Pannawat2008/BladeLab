import { defineConfig } from "vite";

// Relative base so the built bundle works from a static file server / sub-path.
export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
  },
});

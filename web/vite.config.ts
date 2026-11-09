import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/healthz": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
});

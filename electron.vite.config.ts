import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      minify: "esbuild",
      target: "node24",
      sourcemap: true, 
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
      },
    },
    build: {
      minify: "esbuild",
      target: "node22",
      sourcemap: true, // Optional: also add for renderer
    },
    plugins: [react(), tailwindcss()],
  },
});

import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      // viteStaticCopy({
      //   targets: [
      //     {
      //       src: "src/main/voicegroupParser/build/arm64-apple-macosx/release/libNodeAPI.dylib",
      //       dest: "chunks",
      //     },
      //     // add this too if you end up producing it:
      //     // { src: 'src/main/voicegroupParser/build/arm64-apple-macosx/release/libModule.dylib', dest: 'chunks' },
      //   ],
      // }),
    ],
    resolve: {
      alias: {
        "@shared": resolve("src/shared"),
      },
    },
    build: {
      minify: "esbuild",
      target: "node24",
      sourcemap: true,
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@shared": resolve("src/shared"),
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@shared": resolve("src/shared"),
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

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss(), cssInjectedByJsPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env": "{}",
  },
  build: {
    outDir: "dist/widget",
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, "src/widget.tsx"),
      name: "OVRChatWidget",
      fileName: () => "chat-widget.js",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    minify: true,
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// kdbrian.github.io is a *user* Pages site, so it's served from the domain
// root — base stays "/". If you ever move this to a *project* Pages repo
// (username.github.io/repo-name), change base to "/repo-name/".
export default defineConfig({
  plugins: [react()],
  base: "/",
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});

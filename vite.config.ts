import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

// kdbrian.github.io is a *user* Pages site, so it's served from the domain
// root — base stays "/". If you ever move this to a *project* Pages repo
// (username.github.io/repo-name), change base to "/repo-name/".
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon-32.png", "apple-touch-icon.png"],
      manifest: {
        name: "Brian Kidiga — Android Developer",
        short_name: "Brian Kidiga",
        description:
          "Android developer building Kotlin & Jetpack Compose apps. Projects, activity, and writing.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#FAFAF9",
        theme_color: "#1C1917",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallbackDenylist: [/^\/404\.html$/],
      },
    }),
  ],
  base: "/",
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});

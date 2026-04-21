import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      includeAssets: [
        "favicon.ico",
        "pwa-192x192.png",
        "pwa-512x512.png",
      ],
      manifest: {
        name: "Nur Ezan Vakti",
        short_name: "Nur Ezan Vakti",
        description:
          "Modern namaz vakitleri uygulaması - Ezan vakitleri, Kıble pusulası ve daha fazlası",
        theme_color: "#065f46",
        background_color: "#fafafa",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        categories: ["lifestyle", "utilities"],
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        screenshots: [
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "narrow",
          },
        ],
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,json}"],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

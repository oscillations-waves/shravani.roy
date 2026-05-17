import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import solidJs from "@astrojs/solid-js";
import { fileURLToPath } from "node:url";

// GitHub Pages deployment.
// In dev, the site is served at `/`. For a project-page deploy (e.g.
// https://oscillations-waves.github.io/shravani.roy/), set BASE_PATH=/shravani.roy
// before running `npm run build` (the CI workflow does this automatically).
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  site: "https://oscillations-waves.github.io",
  base,
  integrations: [mdx(), sitemap(), solidJs(), tailwind({ applyBaseStyles: false })],
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
        "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      },
    },
  },
});
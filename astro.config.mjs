import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import solidJs from "@astrojs/solid-js";
import { fileURLToPath } from "node:url";

export default defineConfig({
  site: "https://astro-sphere-demo.vercel.app",
  integrations: [mdx(), sitemap(), solidJs(), tailwind({ applyBaseStyles: false })],
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
        "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
        "@/consts": fileURLToPath(new URL("./src/consts", import.meta.url)),
      },
    },
  },
});
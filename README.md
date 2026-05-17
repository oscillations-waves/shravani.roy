# shravani.roy

Personal blog and portfolio of Shravani Roy. Built with [Astro](https://astro.build), TypeScript, Tailwind CSS, and SolidJS.

## Develop

```bash
npm install
npm run dev          # http://localhost:4321
```

## Build

```bash
npm run build        # type-check + build to ./dist
npm run preview      # preview the production build
```

## Content

Markdown / MDX lives in [src/content](src/content):

- `blog/` — blog posts
- `projects/` — project entries
- `work/` — work history
- `legal/` — privacy / terms

Site-wide config (title, socials, nav) is in [src/consts.ts](src/consts.ts).

## Deploy (GitHub Pages)

Pushing to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml) which builds and publishes to GitHub Pages.

In your repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The site URL is controlled by `site` + `base` in [astro.config.mjs](astro.config.mjs):

- Project repo `shravani.roy` → `https://oscillations-waves.github.io/shravani.roy/`
- User repo `oscillations-waves.github.io` → remove `base` and set `site` to the root URL.
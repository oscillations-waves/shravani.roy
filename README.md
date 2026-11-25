# shravani.roy

Personal blog and portfolio of Shravani Roy. Built with [Astro](https://astro.build), TypeScript, Tailwind CSS, and SolidJS.

## Develop

Clone the private content repository from the site checkout with an account that can read it.

```bash
git clone https://github.com/oscillations-waves/shravani.roy-content.git .private-content
npm ci --legacy-peer-deps
node scripts/prepare-content.mjs
npm run dev          # http://localhost:4321
```

## Build

```bash
node scripts/prepare-content.mjs
npm run build        # type-check + build to ./dist
npm run preview      # preview the production build
```

## Content

Keep blog Markdown, MDX, and photos in the private checkout. Edit files under `published/` there and run `node scripts/prepare-content.mjs` to refresh the local site inputs. The script replaces the generated copies. To preview changes made on GitHub, run `git -C .private-content pull --ff-only` first. To use a checkout at a different location, pass its path as the script argument.

Put unpublished posts under `drafts/` and original photos under `originals/` in the private checkout. When a post is ready, set `draft: false`, move it and its images into `published/`, then commit and push to the private repository. The rendered pages and images on the finished site are public.

Project entries, work history, and legal pages live in [src/content](src/content).

Site-wide config (title, socials, nav) is in [src/consts.ts](src/consts.ts).

## Deploy (GitHub Pages)

[The deployment workflow](.github/workflows/deploy.yml) runs on pushes to `main`, manual runs, and scheduled checks for private content updates every 30 minutes. It checks out the private repository with a read-only deploy key stored as the `CONTENT_DEPLOY_KEY` Actions secret, prepares the published files, and uploads the generated site to GitHub Pages.

In your repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The site URL is controlled by `site` + `base` in [astro.config.mjs](astro.config.mjs):

- Project repo `shravani.roy` → `https://oscillations-waves.github.io/shravani.roy/`
- User repo `oscillations-waves.github.io` → remove `base` and set `site` to the root URL.

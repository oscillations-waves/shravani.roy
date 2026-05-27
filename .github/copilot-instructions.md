# Copilot Instructions — shravani.roy

## Who this is

Personal blog and portfolio of **Shravani Roy**, Senior Software Engineer at Progress Chef.
Background spans cloud-native infrastructure, AI/LLM tooling, Golang, Ruby/Rails, Kubernetes, and DevOps.
GitHub: [oscillations-waves](https://github.com/oscillations-waves)

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Astro (SSR optional, currently static) |
| UI islands | SolidJS (`.tsx`) |
| Styling | Tailwind CSS v4 (CSS-first, no config file) |
| Language | TypeScript (strict) |
| Content | Markdown (`.md`) via Astro Content Collections |
| Search | Fuse.js (client-side fuzzy search) |
| Package manager | npm |

Key files:
- `src/consts.ts` — site-wide constants (title, nav links, socials)
- `src/content.config.ts` — content collection schemas (blog, projects, work, legal)
- `src/lib/utils.ts` — shared utilities
- `src/styles/global.css` — global styles, Tailwind import

---

## Content collections & frontmatter schemas

### Blog posts — `src/content/blog/<slug>/index.md`
```yaml
---
title: "Post Title"
summary: "One sentence summary shown in listings."
date: "Month DD YYYY"   # e.g. "May 15 2026"
draft: false            # true = hidden from production
tags:
  - ruby
  - fundamentals
---
```

### Projects — `src/content/projects/<slug>/index.md`
```yaml
---
title: "Project Name"
summary: "Short description shown in listings."
date: "Month DD YYYY"
draft: false
tags:
  - tag1
demoUrl: "https://..."  # optional
repoUrl: "https://..."  # optional
---
```

### Work — `src/content/work/<slug>.md`
```yaml
---
company: "Company Name"
role: "Job Title"
dateStart: "MM/DD/YYYY"
dateEnd: "MM/DD/YYYY"  # or "Present"
---
```

---

## Writing style

Shravani's writing is:
- **Clear and approachable** — explains concepts from first principles, never assumes too much
- **Example-driven** — uses code blocks liberally; code is annotated with inline comments
- **Personal** — first-person voice, occasional enthusiasm ("let me just start by saying...")
- **Structured** — uses H2/H3 headings, bullet lists, and blockquote callouts for notes/tips
- **Concise** — paragraphs are short; no filler

Tone: friendly technical writing, not academic. Think "knowledgeable friend explaining clearly."

### Conventions
- Inline code: use backticks — `like_this`
- Callouts: `> **Note:** ...` blockquote format
- Code blocks: always specify the language (` ```ruby `, ` ```go `, etc.)
- Series posts: link to the previous/next post at the end
- Closing line: end tutorial posts with a warm sign-off ("Happy coding! :)")

---

## Gradual improvement goals

When helping with this blog, keep these improvement directions in mind:

### Content
- [ ] Expand the Ruby series (variables → methods → blocks → classes → modules → metaprogramming)
- [ ] Add posts on topics from Shravani's work: Golang patterns, LLM tooling, Kubernetes, RBAC design
- [ ] Write a "How I built LogGPT" deep-dive (GPT4All + LangChain + FAISS)
- [ ] Conference recap format works well — apply to future events
- [ ] Add "TIL" (Today I Learned) short-form posts for quick insights

### SEO & metadata
- Every post needs a strong `summary` (used as meta description) — aim for 120–155 chars
- Tags should be specific and consistent (prefer `ruby` not `Ruby`)
- Add `<meta property="og:image">` to blog posts for social sharing

### Accessibility
- All `<img>` tags must have meaningful `alt` text — never leave it empty
- `<figure>` + `<figcaption>` pattern is good — keep using it
- Ensure heading hierarchy is correct (H1 → H2 → H3, no skipping)
- Check colour contrast in dark mode for callout/blockquote styles

### Performance
- Prefer `sharp`-optimised images — use Astro's `<Image />` component instead of raw `<img>`
- Lazy-load images below the fold
- Keep SolidJS islands lean — don't hydrate static content

### Code quality
- Components in `src/components/` should be typed with explicit prop interfaces
- Avoid `any` — use `unknown` and narrow types
- Use Astro's `getCollection()` API; never read content files directly with `fs`

---

## Patterns to follow

### Adding a new blog post
1. Create `src/content/blog/<slug>/index.md`
2. Follow the frontmatter schema above
3. Place images in the same directory; reference as `/blog/<slug>/image.jpg`
4. Set `draft: true` while writing; flip to `false` to publish

### Adding a new project
1. Create `src/content/projects/<slug>/index.md`
2. Include `repoUrl` and/or `demoUrl` if applicable

### Creating a new component
- SolidJS for interactive islands (`.tsx`)
- Astro components (`.astro`) for static/server-rendered UI
- Always import Tailwind classes directly — no CSS modules

---

## Related project

**askMyBlog** (`../askMyBlog`) — a RAG-powered chat interface that answers questions about blog posts.
Stack: Astro SSR + SolidJS + Google Gemini (`text-embedding-004` + `gemini-1.5-flash`) + SQLite + sqlite-vec.
When new blog posts are published, run `npm run index` in askMyBlog to re-embed them.

---

## Do not

- Do not edit files in `dist/` — that's build output
- Do not add a `tailwind.config.js` — Tailwind v4 is configured via CSS
- Do not use React — the island framework is SolidJS
- Do not use `getStaticPaths` with SSR adapter — keep pages static unless interactivity is needed

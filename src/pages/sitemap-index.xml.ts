import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const site = "https://shravani.roy";

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = async () => {
  const [posts, projects] = await Promise.all([
    getCollection("blog"),
    getCollection("projects"),
  ]);

  const pages = [
    "/",
    "/work/",
    "/blog/",
    "/projects/",
    ...posts.filter((post) => !post.data.draft).map((post) => `/blog/${post.slug}/`),
    ...projects
      .filter((project) => !project.data.draft)
      .map((project) => `/projects/${project.slug}/`),
  ];

  const urls = pages
    .map((path) => `  <url><loc>${escapeXml(new URL(path, site).href)}</loc></url>`)
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } }
  );
};

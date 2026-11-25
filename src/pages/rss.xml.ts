import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import { getCollection } from "astro:content"
import { SITE } from "@/consts"
import { withBase } from "@/lib/utils"

export const GET: APIRoute = async ({ site, url }) => {
  const posts = await getCollection("blog", ({ data }) => !data.draft)
  const projects = await getCollection("projects")

  const items = [...posts, ...projects]

  items.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())

  return rss({
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    site: new URL(withBase("/"), site ?? url.origin),
    items: items.map((item) => ({
      title: item.data.title,
      description: item.data.summary,
      pubDate: item.data.date,
      categories: item.data.tags,
      link: `${item.collection}/${item.id}/`,
    })),
  })
}

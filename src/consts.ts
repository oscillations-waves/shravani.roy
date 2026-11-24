import type { Site, Page, Links, Socials } from "@/types"

// Global
export const SITE: Site = {
  TITLE: "Shravani Roy",
  SHORT_NAME: "Shravani",
  DESCRIPTION: "Software engineer.",
  AUTHOR: "Shravani Roy",
}

// Work Page
export const WORK: Page = {
  TITLE: "Work",
  DESCRIPTION: "Places I have worked.",
}

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Technical guides, notes on what I’m learning, and the occasional book review.",
}

// Projects Page 
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects I have worked on.",
}

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
}

// Links
export const LINKS: Links = [
  { 
    TEXT: "Home", 
    HREF: "/", 
  },
  {
    TEXT: "Projects",
    HREF: "/projects",
  },
  { 
    TEXT: "Blog", 
    HREF: "/blog", 
  },
  {
    TEXT: "Gallery",
    HREF: "/#gallery",
  },
  {
    TEXT: "About",
    HREF: "/about",
  },
  {
    TEXT: "Ask",
    HREF: "/ask",
  },
]

// Socials
export const SOCIALS: Socials = [
  { 
    NAME: "Email",
    ICON: "email", 
    TEXT: "royshravani12@gmail.com",
    HREF: "mailto:royshravani12@gmail.com",
  },
  { 
    NAME: "Github",
    ICON: "github",
    TEXT: "oscillations-waves",
    HREF: "https://github.com/oscillations-waves"
  },
  { 
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "Shravani Roy",
    HREF: "https://www.linkedin.com/in/shravani-roy-12r842696/",
  },
  { 
    NAME: "Instagram",
    ICON: "instagram",
    TEXT: "shravvanay",
    HREF: "https://www.instagram.com/shravvanay/",
  },
  {
    NAME: "Twitter",
    ICON: "twitter-x",
    TEXT: "R0yalisms",
    HREF: "https://x.com/R0yalisms",
  },
]


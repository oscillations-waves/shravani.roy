export type Page = {
  TITLE: string
  DESCRIPTION: string
}

export interface Site extends Page {
  SHORT_NAME: string
  AUTHOR: string
}

export type Links = {
  TEXT: string
  HREF: string
}[]

export type Socials = {
  NAME: string
  ICON: string
  TEXT: string
  HREF: string
}[]

---
title: "Ask My Blog"
summary: "A RAG-powered chat app that lets you ask questions about my writing. Answers are grounded in actual blog posts using OpenAI embeddings and GPT-4o-mini, with source citations."
date: "May 18 2026"
draft: false
tags:
  - rag
  - ai
  - astro
  - openai
  - sqlite
demoUrl: "https://ask.shravani.roy"
repoUrl: "https://github.com/oscillations-waves/askMyBlog"
---

A semantic search + chat interface over my own writing.

Ask things like *"What did Shravani write about Ruby variables?"* or *"Summarize the RubyConf 2022 post"* and get answers grounded in my actual posts, with links to the source.

Built with Astro (SSR), SolidJS, OpenAI `text-embedding-3-small` for embeddings, `gpt-4o-mini` for answers, and SQLite + `sqlite-vec` as the vector store — no external database required.

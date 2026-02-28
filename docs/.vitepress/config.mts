import { defineConfig } from "vitepress";

export default defineConfig({
  title: "ani-client",
  description: "A simple, typed client to fetch anime, manga, character, staff and user data from AniList.",
  head: [["link", { rel: "icon", href: "./assets/favicon.ico", type: "image/x-icon" }]],
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/introduction" },
      { text: "API", link: "/reference/api" },
      { text: "Showcase", link: "/showcase" },
      { text: "Changelog", link: "/changelog" },
    ],
    logo: "./assets/logo.png",

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "What is ani-client?", link: "/guide/introduction" },
            { text: "Getting Started", link: "/guide/getting-started" },
          ],
        },
        {
          text: "Core Features",
          items: [
            { text: "Fetching Data", link: "/guide/fetching-data" },
            { text: "Relations & Includes", link: "/guide/includes" },
            { text: "Batch Queries", link: "/guide/batch-queries" },
            { text: "Pagination", link: "/guide/pagination" },
          ],
        },
        {
          text: "Advanced",
          items: [
            { text: "Caching", link: "/guide/caching" },
            { text: "Rate Limiting & Retries", link: "/guide/rate-limiting" },
            { text: "Event Hooks", link: "/guide/event-hooks" },
            { text: "Markdown Parser", link: "/guide/markdown-parser" },
          ],
        },
      ],
      "/reference/": [
        {
          text: "API Reference",
          items: [
            { text: "Client Methods", link: "/reference/api" },
            { text: "Types & Enums", link: "/reference/types" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/gonzyui/ani-client" },
      { icon: "npm", link: "https://www.npmjs.com/package/ani-client" },
    ],

    search: {
      provider: "local",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © <a href='https://github.com/gonzyui'>gonzyui</a>",
    },
  },
});

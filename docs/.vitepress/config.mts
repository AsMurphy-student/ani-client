import { defineConfig } from "vitepress";

const siteUrl = "https://ani-client.js.org";
const siteTitle = "ani-client";
const siteDescription =
  "A simple, typed client to fetch anime, manga, character, staff and user data from AniList.";
const ogImage = `${siteUrl}/assets/logo.png`;

export default defineConfig({
  title: siteTitle,
  description: siteDescription,
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: siteUrl },

  head: [
    // Favicon
    ["link", { rel: "icon", href: "/assets/favicon.ico", type: "image/x-icon" }],
    ["link", { rel: "apple-touch-icon", href: "/assets/logo.png" }],

    // Primary meta
    ["meta", { name: "theme-color", content: "#3451b2" }],
    ["meta", { name: "author", content: "gonzyui" }],
    ["meta", { name: "keywords", content: "anilist, anime, manga, graphql, api, client, typescript, javascript, node.js" }],

    // Open Graph
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: siteTitle }],
    ["meta", { property: "og:description", content: siteDescription }],
    ["meta", { property: "og:url", content: siteUrl }],
    ["meta", { property: "og:image", content: ogImage }],
    ["meta", { property: "og:image:alt", content: "ani-client logo" }],
    ["meta", { property: "og:image:width", content: "512" }],
    ["meta", { property: "og:image:height", content: "512" }],
    ["meta", { property: "og:site_name", content: siteTitle }],
    ["meta", { property: "og:locale", content: "en_US" }],

    // Twitter Card
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: siteTitle }],
    ["meta", { name: "twitter:description", content: siteDescription }],
    ["meta", { name: "twitter:image", content: ogImage }],
    ["meta", { name: "twitter:image:alt", content: "ani-client logo" }],
  ],

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/introduction" },
      { text: "API", link: "/reference/api" },
      { text: "Showcase", link: "/showcase" },
      { text: "Changelog", link: "/changelog" },
    ],
    logo: "/assets/logo.png",

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

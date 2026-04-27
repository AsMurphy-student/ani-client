import { defineConfig } from "vitepress";
import pkg from "../../package.json";

const siteUrl = "https://ani-client.js.org";
const siteTitle = "ani-client";
const siteDescription = "A simple, typed client to fetch anime, manga, character, staff and user data from AniList.";
const ogImage = `${siteUrl}/assets/image.png`;

export default defineConfig({
  transformHead({ pageData }) {
    const canonicalUrl = `${siteUrl}/${pageData.relativePath}`.replace(/index\.md$/, "").replace(/\.md$/, "");
    return [
      ["link", { rel: "canonical", href: canonicalUrl }],
      ["meta", { property: "og:url", content: canonicalUrl }],
      ["meta", { property: "og:image", content: ogImage }],
      ["meta", { name: "twitter:image", content: ogImage }],
      ["meta", { name: "twitter:image:alt", content: "ani-client logo" }],
    ];
  },
  lang: "en-US",
  title: siteTitle,
  description: siteDescription,
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: siteUrl },

  head: [
    ["meta", { name: "google-site-verification", content: "nZEH3l3JtkpXj8ejMHKCOSNynDudM2N06p_QVyMlBds" }],
    ["link", { rel: "icon", href: "/assets/favicon.ico", type: "image/x-icon" }],
    ["link", { rel: "apple-touch-icon", href: "/assets/logo.png" }],

    ["meta", { name: "theme-color", content: "#3451b2" }],
    ["meta", { name: "author", content: "gonzyui" }],
    [
      "meta",
      {
        name: "keywords",
        content:
          "ani-client, aniclient, anilist, anilist-client, anilist-api, anilist-wrapper, anime, manga, graphql, api, client, wrapper, typescript, javascript, node, node.js, typed",
      },
    ],

    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: siteTitle }],
    ["meta", { property: "og:description", content: siteDescription }],
    ["meta", { property: "og:image", content: ogImage }],
    ["meta", { property: "og:image:alt", content: "ani-client logo" }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { property: "og:site_name", content: siteTitle }],
    ["meta", { property: "og:locale", content: "en_US" }],

    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: siteTitle }],
    ["meta", { name: "twitter:description", content: siteDescription }],
    ["meta", { name: "twitter:image", content: ogImage }],
    ["meta", { name: "twitter:image:alt", content: "ani-client logo" }],

    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "ani-client",
        softwareVersion: pkg.version,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Node.js",
        description: "A typed AniList client for Node.js & TypeScript",
        url: "https://ani-client.js.org",
        downloadUrl: "https://www.npmjs.com/package/ani-client",
        sameAs: "https://github.com/gonzyui/ani-client",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: { "@type": "Person", name: "gonzyui", url: "https://gonzyuidev.xyz" },
        license: "https://opensource.org/licenses/MIT",
      }),
    ],
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
            { text: "Cookbook", link: "/guide/cookbook" },
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
      { icon: "discord", link: "https://discord.gg/3P7twDurUD" },
    ],

    editLink: {
      pattern: "https://github.com/gonzyui/ani-client/edit/dev/docs/:path",
      text: "Edit this page on GitHub",
    },

    search: {
      provider: "local",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © <a href='https://gonzyuidev.xyz/'>gonzyui</a>",
    },
  },
});

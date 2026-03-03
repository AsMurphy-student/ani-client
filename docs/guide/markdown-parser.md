---
title: Markdown Parser
description: "Convert AniList's custom markdown syntax (spoilers, images, YouTube embeds, centered text) into standard HTML with parseAniListMarkdown."
head:
  - - meta
    - property: og:title
      content: Markdown Parser — ani-client
  - - meta
    - property: og:description
      content: Parse AniList's custom markdown dialect into HTML — supports spoilers, images, YouTube, WebM, and standard formatting.
---

# Markdown Parser Utility

AniList uses a custom dialect of Markdown for platform-specific formatting, for example to hide spoilers, center text, or embed media like YouTube and WebM videos. `ani-client` provides the `parseAniListMarkdown` function to convert this specific syntax into HTML that can be rendered by any web browser.

## Usage

You can import the function directly from the package's main entry point:

```ts
import { parseAniListMarkdown } from "ani-client";

const description = "This character dies at the end! ~! Just kidding! ~";

const html = parseAniListMarkdown(description);
// "This character dies at the end! <span class=\"anilist-spoiler\">Just kidding! </span>"
```

## Supported Features

### AniList Specific Tags

-   **Spoilers** (`~!...!~`): Converted to `<span class="anilist-spoiler">...</span>`
-   **Standard Images** (`img(...)`): Converted to `<img src="..." alt="" class="anilist-image" />`
-   **Resized Images** (`img400(...)`): Converted to `<img src="..." width="400" alt="" class="anilist-image" />`
-   **YouTube Videos** (`youtube(...)`): Converted to `<iframe src="..." class="anilist-youtube">...</iframe>`
-   **WebM Videos** (`webm(...)`): Converted to `<video src="..." class="anilist-webm">...</video>`
-   **Centered Text** (`~~~center~~~`): Converted to `<div class="anilist-center">center</div>`

### Standard Markdown

The function also handles a standard subset of Markdown commonly used in AniList descriptions and reviews:

-   **Bold**: `__text__` or `**text**`
-   **Italic**: `_text_` or `*text*`
-   **Strikethrough**: `~~text~~`
-   **Links**: `[Text](https://...)`
-   **Headings**: `#` through `######` (h1–h6)
-   **Unordered lists**: Lines starting with `-` or `*`
-   **Ordered lists**: Lines starting with `1.`, `2.`, etc.
-   **Inline code**: `` `code` ``
-   **Fenced code blocks**: ` ```code``` `
-   **Paragraphs**: Two consecutive line breaks are converted to `<p>`, and single line breaks to `<br/>`

::: warning Security
This function escapes all HTML entities (`<`, `>`, `&`, `"`, `'`) to prevent **XSS attacks**. However, the output is still raw HTML. Consumers should still use a Content Security Policy and consider additional sanitization when rendering user-generated content in a browser.
:::


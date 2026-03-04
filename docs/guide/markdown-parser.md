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

# Markdown Parser

AniList uses a custom Markdown dialect for spoilers, centered text, and media embeds. `ani-client` provides `parseAniListMarkdown` to convert this syntax into standard HTML.

## Usage

Import the function from the package root:

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
This function escapes all HTML entities (`<`, `>`, `&`, `"`, `'`) to prevent **XSS attacks**. Additionally, all URLs in `img()`, `webm()`, and `[link]()` syntax are validated against an `https?://` protocol allowlist — URLs using `javascript:`, `data:`, or other dangerous protocols are silently stripped. YouTube embed IDs are validated against `[\w-]+`.

However, the output is still raw HTML. Consumers should still use a Content Security Policy and consider additional sanitization when rendering user-generated content in a browser.
:::


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
-   **Paragraphs**: Two consecutive line breaks are converted to `<p>`, and single line breaks to `<br/>`.

/**
 * Parses AniList specific markdown into standard HTML.
 * Includes formatting for spoilers, images, videos (youtube/webm), and standard markdown elements.
 *
 * @param text The AniList markdown text to parse
 * @returns The parsed HTML string
 */
export function parseAniListMarkdown(text: string): string {
  if (!text) return "";

  let html = text;

  // ── 1. AniList Specific Tags ──

  // Spoilers: ~! spoiler !~
  html = html.replace(/~!(.*?)!~/gs, '<span class="anilist-spoiler">$1</span>');

  // Centered text: ~~~center~~~
  html = html.replace(/~~~(.*?)~~~/gs, '<div class="anilist-center">$1</div>');

  // Images with width: img400(url)
  html = html.replace(/img(\d+)\((.*?)\)/gi, '<img src="$2" width="$1" alt="" class="anilist-image" />');

  // Standard Images: img(url)
  html = html.replace(/img\((.*?)\)/gi, '<img src="$1" alt="" class="anilist-image" />');

  // Youtube Videos: youtube(id)
  html = html.replace(
    /youtube\((.*?)\)/gi,
    '<iframe src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen class="anilist-youtube"></iframe>',
  );

  // WebM Videos: webm(url)
  html = html.replace(/webm\((.*?)\)/gi, '<video src="$1" controls class="anilist-webm"></video>');

  // ── 2. Standard Markdown Elements ──

  // Bold: __text__ or **text**
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic: _text_ or *text*
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  // Only match *text* if not inside a strong tag
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");

  // Strikethrough: ~~text~~
  html = html.replace(/~~(.*?)~~/g, "<del>$1</del>");

  // Links: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Paragraphs and Line Breaks
  html = html.replace(/\r\n/g, "\n");
  const paragraphs = html.split(/\n{2,}/);
  html = paragraphs
    .map((p) => {
      const withBr = p.replace(/\n/g, "<br />");
      // Basic heuristic to avoid wrapping block elements in <p>
      if (withBr.match(/^(<div|<iframe|<video|<img)/)) {
        return withBr;
      }
      return `<p>${withBr}</p>`;
    })
    .join("\n");

  return html;
}

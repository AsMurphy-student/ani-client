/**
 * Parses AniList specific markdown into standard HTML.
 * Includes formatting for spoilers, images, videos (youtube/webm), headings,
 * lists, code blocks, and standard markdown elements.
 *
 * @security This function escapes HTML entities to prevent XSS attacks.
 * However, the output is still raw HTML — consumers should always use a
 * Content Security Policy and consider additional sanitization when rendering
 * user-generated content in a browser.
 *
 * @param text The AniList markdown text to parse
 * @returns The parsed HTML string
 */
/** @internal Check that a URL uses a safe protocol (http/https). */
function isSafeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function parseAniListMarkdown(text: string): string {
  if (!text) return "";

  let html = text;

  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  html = html.replace(/```([\s\S]*?)```/g, (_match, code: string) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  html = html.replace(/~!(.*?)!~/gs, '<span class="anilist-spoiler">$1</span>');

  html = html.replace(/~~~(.*?)~~~/gs, '<div class="anilist-center">$1</div>');

  html = html.replace(/img(\d+)\((.*?)\)/gi, (_match, width: string, url: string) =>
    isSafeUrl(url) ? `<img src="${url}" width="${width}" alt="" class="anilist-image" />` : "",
  );

  html = html.replace(/img\((.*?)\)/gi, (_match, url: string) =>
    isSafeUrl(url) ? `<img src="${url}" alt="" class="anilist-image" />` : "",
  );

  html = html.replace(/youtube\((.*?)\)/gi, (_match, id: string) => {
    if (!/^[\w-]+$/.test(id)) return "";
    return `<iframe src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen class="anilist-youtube"></iframe>`;
  });

  html = html.replace(/webm\((.*?)\)/gi, (_match, url: string) =>
    isSafeUrl(url) ? `<video src="${url}" controls class="anilist-webm"></video>` : "",
  );

  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");

  html = html.replace(/~~(.*?)~~/g, "<del>$1</del>");

  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (_match, text: string, url: string) =>
    isSafeUrl(url) ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>` : text,
  );

  html = html.replace(/\r\n/g, "\n");
  const lines = html.split("\n");
  const processed: string[] = [];
  let listType: "ul" | "ol" | null = null;

  for (const line of lines) {
    const ulMatch = line.match(/^[\s]*[-*]\s+(.*)/);
    const olMatch = line.match(/^[\s]*\d+\.\s+(.*)/);

    if (ulMatch) {
      if (listType !== "ul") {
        if (listType) processed.push(`</${listType}>`);
        processed.push("<ul>");
        listType = "ul";
      }
      processed.push(`<li>${ulMatch[1]}</li>`);
    } else if (olMatch) {
      if (listType !== "ol") {
        if (listType) processed.push(`</${listType}>`);
        processed.push("<ol>");
        listType = "ol";
      }
      processed.push(`<li>${olMatch[1]}</li>`);
    } else {
      if (listType) {
        processed.push(`</${listType}>`);
        listType = null;
      }
      processed.push(line);
    }
  }
  if (listType) processed.push(`</${listType}>`);

  html = processed.join("\n");

  const paragraphs = html.split(/\n{2,}/);
  html = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      const withBr = trimmed.replace(/\n/g, "<br />");
      if (withBr.match(/^(<div|<iframe|<video|<img|<h[1-6]|<ul|<ol|<pre)/)) {
        return withBr;
      }
      return `<p>${withBr}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return html;
}

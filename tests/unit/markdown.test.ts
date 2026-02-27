import { describe, expect, it } from "vitest";
import { parseAniListMarkdown } from "../../src/utils";

describe("parseAniListMarkdown", () => {
  it("handles null or empty string", () => {
    expect(parseAniListMarkdown("")).toBe("");
  });

  describe("AniList specific tags", () => {
    it("parses spoiler tags", () => {
      const result = parseAniListMarkdown("This is a ~!huge spoiler!~ indeed.");
      expect(result).toContain('<span class="anilist-spoiler">huge spoiler</span>');
    });

    it("parses centered text", () => {
      const result = parseAniListMarkdown("~~~Centered Text~~~");
      expect(result).toContain('<div class="anilist-center">Centered Text</div>');
    });

    it("parses standard images", () => {
      const result = parseAniListMarkdown("Look at this: img(https://example.com/image.png)");
      expect(result).toContain('<img src="https://example.com/image.png" alt="" class="anilist-image" />');
    });

    it("parses width-constrained images", () => {
      const result = parseAniListMarkdown("Look at this: img400(https://example.com/image.png)");
      expect(result).toContain('<img src="https://example.com/image.png" width="400" alt="" class="anilist-image" />');
    });

    it("parses youtube videos", () => {
      const result = parseAniListMarkdown("youtube(dQw4w9WgXcQ)");
      expect(result).toContain('<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"');
    });

    it("parses webm videos", () => {
      const result = parseAniListMarkdown("webm(https://example.com/video.webm)");
      expect(result).toContain('<video src="https://example.com/video.webm"');
    });
  });

  describe("Standard Markdown Elements", () => {
    it("parses bold and italic", () => {
      const result = parseAniListMarkdown("__Bold__ and **Bold2** and _Italic_ and *Italic2*");
      expect(result).toContain("<strong>Bold</strong>");
      expect(result).toContain("<strong>Bold2</strong>");
      expect(result).toContain("<em>Italic</em>");
      expect(result).toContain("<em>Italic2</em>");
    });

    it("parses strikethrough", () => {
      const result = parseAniListMarkdown("~~Struck~~");
      expect(result).toContain("<del>Struck</del>");
    });

    it("parses links", () => {
      const result = parseAniListMarkdown("[AniList](https://anilist.co)");
      expect(result).toContain('<a href="https://anilist.co" target="_blank" rel="noopener noreferrer">AniList</a>');
    });

    it("converts double newlines to paragraphs and single newlines to br", () => {
      const text = "First line\nSecond line\n\nNew paragraph";
      const result = parseAniListMarkdown(text);
      expect(result).toContain("<p>First line<br />Second line</p>");
      expect(result).toContain("<p>New paragraph</p>");
    });
  });

  describe("Complex combinations", () => {
    it("handles multiple elements correctly", () => {
      const text = "Wow! ~!Spoiler with **bold** inside!~ and then img420(https://img.com/1.jpg)";
      const result = parseAniListMarkdown(text);
      expect(result).toContain('<span class="anilist-spoiler">Spoiler with <strong>bold</strong> inside</span>');
      expect(result).toContain('<img src="https://img.com/1.jpg" width="420" alt="" class="anilist-image" />');
    });
  });
});

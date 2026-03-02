import { describe, expect, it } from "vitest";
import { buildMediaByIdQuery } from "../../src/queries/builders";

describe("buildMediaByIdQuery", () => {
  it("returns default query when no include options are given", () => {
    const query = buildMediaByIdQuery();
    expect(query).toContain("Media(id: $id)");
    expect(query).toContain("relations");
  });

  it("returns default query when include is undefined", () => {
    const query = buildMediaByIdQuery(undefined);
    expect(query).toContain("Media(id: $id)");
  });

  it("includes characters when characters: true", () => {
    const query = buildMediaByIdQuery({ characters: true });
    expect(query).toContain("characters(perPage: 25");
    expect(query).toContain("role");
    expect(query).toContain("node");
  });

  it("includes characters with custom perPage", () => {
    const query = buildMediaByIdQuery({ characters: { perPage: 50 } });
    expect(query).toContain("characters(perPage: 50");
  });

  it("includes characters without sort when sort: false", () => {
    const query = buildMediaByIdQuery({ characters: { sort: false } });
    expect(query).toContain("characters(perPage: 25)");
    expect(query).not.toMatch(/characters\([^)]*sort:/);
  });

  it("includes voice actors when characters.voiceActors: true", () => {
    const query = buildMediaByIdQuery({ characters: { voiceActors: true } });
    expect(query).toContain("voiceActors");
    expect(query).toContain("languageV2");
  });

  it("includes staff when staff: true", () => {
    const query = buildMediaByIdQuery({ staff: true });
    expect(query).toContain("staff(perPage: 25");
    expect(query).toContain("role");
  });

  it("includes staff with custom perPage", () => {
    const query = buildMediaByIdQuery({ staff: { perPage: 10 } });
    expect(query).toContain("staff(perPage: 10");
  });

  it("excludes relations when relations: false", () => {
    const query = buildMediaByIdQuery({ relations: false });
    expect(query).not.toContain("relations");
  });

  it("includes relations by default", () => {
    const query = buildMediaByIdQuery({ characters: true });
    expect(query).toContain("relations");
  });

  it("includes streamingEpisodes", () => {
    const query = buildMediaByIdQuery({ streamingEpisodes: true });
    expect(query).toContain("streamingEpisodes");
    expect(query).toContain("thumbnail");
    expect(query).toContain("url");
    expect(query).toContain("site");
  });

  it("includes externalLinks", () => {
    const query = buildMediaByIdQuery({ externalLinks: true });
    expect(query).toContain("externalLinks");
    expect(query).toContain("icon");
    expect(query).toContain("color");
  });

  it("includes stats", () => {
    const query = buildMediaByIdQuery({ stats: true });
    expect(query).toContain("scoreDistribution");
    expect(query).toContain("statusDistribution");
  });

  it("includes recommendations with default perPage", () => {
    const query = buildMediaByIdQuery({ recommendations: true });
    expect(query).toContain("recommendations(perPage: 10");
    expect(query).toContain("mediaRecommendation");
  });

  it("includes recommendations with custom perPage", () => {
    const query = buildMediaByIdQuery({ recommendations: { perPage: 5 } });
    expect(query).toContain("recommendations(perPage: 5");
  });

  it("combines multiple include options", () => {
    const query = buildMediaByIdQuery({
      characters: true,
      staff: true,
      streamingEpisodes: true,
      externalLinks: true,
      stats: true,
      recommendations: true,
    });
    expect(query).toContain("characters");
    expect(query).toContain("staff");
    expect(query).toContain("streamingEpisodes");
    expect(query).toContain("externalLinks");
    expect(query).toContain("scoreDistribution");
    expect(query).toContain("recommendations");
  });
});

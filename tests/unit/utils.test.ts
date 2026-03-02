import { describe, expect, it } from "vitest";
import { chunk, clampPerPage, normalizeQuery, sortObjectKeys, validateId, validateIds } from "../../src/utils";

describe("normalizeQuery", () => {
  it("collapses multiple whitespace to single space", () => {
    expect(normalizeQuery("query  {  Media  }")).toBe("query { Media }");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizeQuery("  query { Media }  ")).toBe("query { Media }");
  });

  it("handles newlines and tabs", () => {
    expect(normalizeQuery("query\n{\n\tMedia\n}")).toBe("query { Media }");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(normalizeQuery("   ")).toBe("");
  });
});

describe("clampPerPage", () => {
  it("clamps to minimum of 1", () => {
    expect(clampPerPage(0)).toBe(1);
    expect(clampPerPage(-5)).toBe(1);
  });

  it("clamps to maximum of 50", () => {
    expect(clampPerPage(100)).toBe(50);
    expect(clampPerPage(51)).toBe(50);
  });

  it("passes through valid values", () => {
    expect(clampPerPage(1)).toBe(1);
    expect(clampPerPage(25)).toBe(25);
    expect(clampPerPage(50)).toBe(50);
  });
});

describe("chunk", () => {
  it("splits array into chunks of given size", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns single chunk if array is smaller than size", () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it("returns empty array for empty input", () => {
    expect(chunk([], 5)).toEqual([]);
  });

  it("handles chunk size of 1", () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });
});

describe("validateId", () => {
  it("accepts positive integers", () => {
    expect(() => validateId(1)).not.toThrow();
    expect(() => validateId(100)).not.toThrow();
    expect(() => validateId(999999)).not.toThrow();
  });

  it("rejects zero", () => {
    expect(() => validateId(0)).toThrow(RangeError);
  });

  it("rejects negative numbers", () => {
    expect(() => validateId(-1)).toThrow(RangeError);
    expect(() => validateId(-100)).toThrow(RangeError);
  });

  it("rejects NaN", () => {
    expect(() => validateId(Number.NaN)).toThrow(RangeError);
  });

  it("rejects Infinity", () => {
    expect(() => validateId(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => validateId(Number.NEGATIVE_INFINITY)).toThrow(RangeError);
  });

  it("rejects non-integer numbers", () => {
    expect(() => validateId(1.5)).toThrow(RangeError);
    expect(() => validateId(0.1)).toThrow(RangeError);
  });

  it("includes label in error message", () => {
    expect(() => validateId(-1, "mediaId")).toThrow(/mediaId/);
  });
});

describe("validateIds", () => {
  it("accepts array of valid IDs", () => {
    expect(() => validateIds([1, 2, 3])).not.toThrow();
  });

  it("rejects if any ID is invalid", () => {
    expect(() => validateIds([1, -1, 3])).toThrow(RangeError);
  });

  it("accepts empty array", () => {
    expect(() => validateIds([])).not.toThrow();
  });
});

describe("sortObjectKeys", () => {
  it("sorts top-level keys alphabetically", () => {
    const result = sortObjectKeys({ z: 1, a: 2, m: 3 }) as Record<string, unknown>;
    expect(Object.keys(result)).toEqual(["a", "m", "z"]);
  });

  it("sorts nested object keys recursively", () => {
    const result = sortObjectKeys({ b: { z: 1, a: 2 }, a: 1 }) as Record<string, Record<string, unknown>>;
    expect(Object.keys(result)).toEqual(["a", "b"]);
    expect(Object.keys(result.b)).toEqual(["a", "z"]);
  });

  it("handles arrays without sorting them", () => {
    const result = sortObjectKeys({ b: [3, 1, 2] }) as Record<string, number[]>;
    expect(result.b).toEqual([3, 1, 2]);
  });

  it("handles nested arrays with objects", () => {
    const result = sortObjectKeys({ a: [{ z: 1, a: 2 }] }) as Record<string, Record<string, unknown>[]>;
    expect(Object.keys(result.a[0])).toEqual(["a", "z"]);
  });

  it("returns primitives unchanged", () => {
    expect(sortObjectKeys(42)).toBe(42);
    expect(sortObjectKeys("hello")).toBe("hello");
    expect(sortObjectKeys(null)).toBe(null);
    expect(sortObjectKeys(true)).toBe(true);
  });
});

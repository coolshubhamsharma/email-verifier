const levenshteinDistance = require("../src/utils/levenshtein");

describe("Levenshtein Distance", () => {
  test("Identical strings", () => {
    expect(levenshteinDistance("gmail", "gmail")).toBe(0);
  });

  test("Single substitution", () => {
    expect(levenshteinDistance("gmial", "gmail")).toBe(2);
  });

  test("Insertion", () => {
    expect(levenshteinDistance("gmal", "gmail")).toBe(1);
  });

  test("Deletion", () => {
    expect(levenshteinDistance("gmail", "gmal")).toBe(1);
  });

  test("Completely different strings", () => {
    expect(levenshteinDistance("abc", "xyz")).toBe(3);
  });

  test("Empty string case", () => {
    expect(levenshteinDistance("", "gmail")).toBe(5);
  });

  test("Error on non-string input", () => {
    expect(() => levenshteinDistance(null, "gmail")).toThrow();
  });
});

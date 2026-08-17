import { describe, it, expect } from "vitest";
import { parseSubmissionBody, slugify } from "../submissions";

describe("parseSubmissionBody", () => {
  it("splits bracketed section markers into sections", () => {
    const parsed = parseSubmissionBody(
      "[Chorus]\nImpundu zavuze mu gitondo\nUmunsi mwiza waratangiye\n\n[Verse 1]\nLine one"
    );
    expect(parsed).toEqual([
      {
        label: "Chorus",
        lines: ["Impundu zavuze mu gitondo", "Umunsi mwiza waratangiye"],
      },
      { label: "Verse 1", lines: ["Line one"] },
    ]);
  });

  it("wraps unmarked lyrics in an implicit Verse 1", () => {
    const parsed = parseSubmissionBody("Line one\nLine two");
    expect(parsed).toEqual([
      { label: "Verse 1", lines: ["Line one", "Line two"] },
    ]);
  });

  it("drops empty sections and blank lines, handles CRLF", () => {
    const parsed = parseSubmissionBody("[Intro]\r\n\r\n[Verse 1]\r\nA line\r\n");
    expect(parsed).toEqual([{ label: "Verse 1", lines: ["A line"] }]);
  });

  it("returns empty for empty input", () => {
    expect(parseSubmissionBody("  \n\n")).toEqual([]);
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Amashyo y'Umutima")).toBe("amashyo-y-umutima");
  });

  it("strips accents and trims hyphens", () => {
    expect(slugify("  Café Kigali! ")).toBe("cafe-kigali");
  });
});

import { describe, it, expect } from "vitest";
import { escapeCSVValue, toCSV } from "./csv";

describe("escapeCSVValue", () => {
  it("neutralises a formula in notes", () => {
    expect(escapeCSVValue("=1+1")).toBe("'=1+1");
  });

  it("neutralises every dangerous leading character", () => {
    for (const c of ["=", "+", "-", "@", "\t", "\r"]) {
      expect(escapeCSVValue(`${c}cmd`)).toBe(`'${c}cmd`);
    }
  });

  it("leaves ordinary values untouched", () => {
    expect(escapeCSVValue("AWS")).toBe("AWS");
    expect(escapeCSVValue(1200)).toBe("1200");
    expect(escapeCSVValue(null)).toBe("");
  });

  it("still quotes commas, quotes and newlines", () => {
    expect(escapeCSVValue('a,b"c')).toBe('"a,b""c"');
    expect(escapeCSVValue("=a,b")).toBe('"\'=a,b"');
  });
});

describe("toCSV", () => {
  it("escapes a notes value of =1+1 in the output row", () => {
    const csv = toCSV([{ Notes: "=1+1" }], ["Notes"]);
    expect(csv).toBe("Notes\n'=1+1");
  });

  it("escapes the header row too", () => {
    expect(toCSV([], ["=Total"])).toBe("'=Total");
  });
});

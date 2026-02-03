import { describe, test, expect } from "bun:test";
import { extractConflicts, formatConflicts } from "../src/sync/conflicts";

describe("sync conflict parsing", () => {
  test("returns empty list when no conflicts", () => {
    const data = { sessions: [{ conflicts: [] }] };
    expect(extractConflicts(data)).toEqual([]);
  });

  test("parses a single conflict", () => {
    const data = {
      sessions: [
        {
          conflicts: [
            {
              path: "src/app.ts",
              alphaVersion: "local",
              betaVersion: "remote",
            },
          ],
        },
      ],
    };

    expect(extractConflicts(data)).toEqual([
      {
        path: "src/app.ts",
        alphaVersion: "local",
        betaVersion: "remote",
      },
    ]);
  });

  test("handles malformed output", () => {
    expect(extractConflicts("not-json")).toEqual([]);
    expect(extractConflicts({})).toEqual([]);
  });

  test("formats conflict list", () => {
    const formatted = formatConflicts([
      { path: "src/app.ts", alphaVersion: "local", betaVersion: "remote" },
      { path: "README.md" },
    ]);

    expect(formatted).toContain("src/app.ts");
    expect(formatted).toContain("alpha");
    expect(formatted).toContain("beta");
    expect(formatted).toContain("README.md");
  });
});

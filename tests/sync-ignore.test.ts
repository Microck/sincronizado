import { describe, test, expect } from "bun:test";
import { mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { loadSyncIgnore, mergeIgnorePatterns } from "../src/sync/ignore";

describe("sync ignore", () => {
  test("loads .syncignore entries and skips comments/blank lines", async () => {
    const dir = await mkdtemp(join(tmpdir(), "sinc-ignore-"));
    const filePath = join(dir, ".syncignore");
    await writeFile(
      filePath,
      "\n# comment\nnode_modules\n  dist  \n\n# another\n.env\n"
    );

    const entries = await loadSyncIgnore(dir);
    expect(entries).toEqual(["node_modules", "dist", ".env"]);
  });

  test("returns empty array when no .syncignore exists", async () => {
    const dir = await mkdtemp(join(tmpdir(), "sinc-ignore-missing-"));
    const entries = await loadSyncIgnore(dir);
    expect(entries).toEqual([]);
  });

  test("merges ignore patterns with de-duplication", () => {
    const merged = mergeIgnorePatterns(
      ["node_modules", ".git"],
      ["dist", "node_modules", "logs"]
    );
    expect(merged).toEqual(["node_modules", ".git", "dist", "logs"]);
  });
});

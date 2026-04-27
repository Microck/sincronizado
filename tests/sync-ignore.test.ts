import { describe, test, expect } from "bun:test";
import { mkdtemp, writeFile, chmod, rm } from "fs/promises";
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

  test("EC-26: strips BOM from .syncignore and processes first pattern correctly", async () => {
    const dir = await mkdtemp(join(tmpdir(), "sinc-ignore-bom-"));
    const filePath = join(dir, ".syncignore");
    const bom = "\uFEFF";
    await writeFile(filePath, bom + "node_modules\n.env\n");
    const entries = await loadSyncIgnore(dir);
    // BOM should be stripped so the first entry is "node_modules", not the BOM itself
    expect(entries).toEqual(["node_modules", ".env"]);
    await rm(dir, { recursive: true });
  });

  test("EC-27: returns empty array on EACCES (permission denied) instead of throwing", async () => {
    const dir = await mkdtemp(join(tmpdir(), "sinc-ignore-perm-"));
    const filePath = join(dir, ".syncignore");
    // Create a directory where we can write a file but not read it back
    await writeFile(filePath, "node_modules\n");
    // chmod 000 makes the file unreadable
    await chmod(filePath, 0o000);
    const entries = await loadSyncIgnore(dir);
    // Should return [] rather than throwing EACCES
    expect(entries).toEqual([]);
    // Restore so cleanup can delete the file
    await chmod(filePath, 0o644);
    await rm(dir, { recursive: true });
  });
});

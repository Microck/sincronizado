import { promises as fs } from "fs";
import { join } from "path";

export async function loadSyncIgnore(projectPath: string): Promise<string[]> {
  const filePath = join(projectPath, ".syncignore");
  let contents: string;
  try {
    contents = await fs.readFile(filePath, "utf8");
  } catch (error) {
    // EC-27 fix: handle permission denied (EACCES) gracefully by returning empty patterns.
    // EC-01 adjacent fix: also handle ENOENT by returning [].
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "EACCES") {
      return [];
    }
    throw error;
  }

  // EC-26 fix: strip UTF-8 BOM before processing. A BOM at the start of the file
  // would otherwise become part of the first pattern or cause silent mis-matches.
  const withoutBom = contents.replace(/^\uFEFF/, "");

  return withoutBom
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.startsWith("#"));
}

export function mergeIgnorePatterns(base: string[], extra: string[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const entry of [...base, ...extra]) {
    if (!entry || seen.has(entry)) {
      continue;
    }
    seen.add(entry);
    merged.push(entry);
  }

  return merged;
}

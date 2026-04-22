import { promises as fs } from "fs";
import { join } from "path";

/**
 * Loads ignore patterns from a .syncignore file in the project directory.
 * @param projectPath - The absolute path to the project directory.
 * @returns An array of non-empty, non-comment ignore patterns.
 */
export async function loadSyncIgnore(projectPath: string): Promise<string[]> {
  const filePath = join(projectPath, ".syncignore");
  let contents: string;
  try {
    contents = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }

  return contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.startsWith("#"));
}

/**
 * Combines two lists of ignore patterns, removing duplicates and empty entries.
 * Preserves the order of entries, with base patterns listed before extra patterns.
 * @param base - The base set of ignore patterns.
 * @param extra - Additional patterns to merge in.
 * @returns A deduplicated, merged list of ignore patterns.
 */
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

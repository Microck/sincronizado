import { homedir } from "os";
import { basename, join } from "path";

/**
 * Returns the absolute path to the sincronizado config file.
 * Uses XDG_CONFIG_HOME if set, otherwise defaults to ~/.config/sincronizado/config.json.
 * @returns The path to the JSON config file.
 */
export function getConfigPath(): string {
  const configBase = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
  return join(configBase, "sincronizado", "config.json");
}

/**
 * Extracts and sanitizes a project name from an absolute path.
 * Converts the directory name to lowercase, replaces spaces with hyphens,
 * removes non-alphanumeric characters, and collapses multiple hyphens.
 * @param absolutePath - The absolute path to the project directory.
 * @returns A sanitized project name (e.g. "my-awesome-project").
 */
export function getProjectName(absolutePath: string): string {
  const base = basename(absolutePath);
  const cleaned = base
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "project";
}

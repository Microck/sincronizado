import { homedir } from "os";
import { basename, join } from "path";

export function getConfigPath(): string {
  const configBase = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
  return join(configBase, "sincronizado", "config.json");
}

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

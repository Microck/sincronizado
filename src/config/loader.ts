import { promises as fs } from "fs";
import { dirname } from "path";
import { configSchema, type Config } from "./schema";
import { DEFAULT_CONFIG } from "./defaults";
import { getConfigPath as getConfigPathUtil } from "../utils/paths";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function getConfigPath(): string {
  return getConfigPathUtil();
}

export async function loadConfig(): Promise<Config> {
  const configPath = getConfigPath();

  try {
    await fs.access(configPath);
  } catch {
    return DEFAULT_CONFIG;
  }

  let raw: string;
  try {
    raw = await fs.readFile(configPath, "utf8");
  } catch (error) {
    throw new ConfigError(`Unable to read config file: ${(error as Error).message}`);
  }

  // EC-01 fix: trim whitespace before parsing. If the result is empty (e.g. a
  // blank file or only whitespace), treat it as a missing config and return defaults.
  const trimmed = raw.trim();
  if (trimmed === "") {
    return DEFAULT_CONFIG;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (error) {
    throw new ConfigError(`Invalid JSON in config file: ${(error as Error).message}`);
  }

  const result = configSchema.safeParse(parsed);
  if (!result.success) {
    throw new ConfigError(result.error.message);
  }

  return result.data;
}

export async function saveConfig(config: Config): Promise<void> {
  const configPath = getConfigPath();
  const dir = dirname(configPath);

  await fs.mkdir(dir, { recursive: true });

  const serialized = JSON.stringify(config, null, 2);

  // EC-02/EC-03 fix: atomic write with backup and safe permissions.
  // 1. Back up the existing config if it exists.
  // 2. Write to a temporary file with mode 0o600 (owner read/write only).
  // 3. Atomically rename the temp file over the target.
  // This prevents data loss from mid-write crashes and avoids a window where
  // the file exists with overly-permissive umask-derived permissions.
  const backupPath = `${configPath}.bak`;
  try {
    await fs.access(configPath);
    await fs.copyFile(configPath, backupPath);
  } catch {
    // Config doesn't exist yet — no backup needed.
  }

  const tmpPath = `${configPath}.tmp`;
  // Use open() with explicit O_CREAT|O_EXCL to ensure the temp file doesn't
  // already exist, then write with mode 0o600.
  const fd = await fs.open(tmpPath, "w", 0o600);
  try {
    await fd.writeFile(serialized + "\n");
  } finally {
    await fd.close();
  }

  await fs.rename(tmpPath, configPath);
}

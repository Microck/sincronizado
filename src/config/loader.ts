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

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
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
  await fs.writeFile(configPath, `${serialized}\n`, { mode: 0o600 });
  await fs.chmod(configPath, 0o600);
}

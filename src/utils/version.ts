import { promises as fs } from "fs";

let cachedVersion: string | null = null;

async function getBundledVersion(): Promise<string | null> {
  try {
    const mod = await import("../generated/version.js");
    return mod.SINC_VERSION ?? null;
  } catch {
    return null;
  }
}

export async function getCliVersion(): Promise<string> {
  if (cachedVersion) {
    return cachedVersion;
  }
  const bundledVersion = await getBundledVersion();
  if (bundledVersion) {
    cachedVersion = bundledVersion;
    return cachedVersion;
  }
  const packageUrl = new URL("../../package.json", import.meta.url);
  const contents = await fs.readFile(packageUrl, "utf8");
  const parsed = JSON.parse(contents) as { version?: string };
  cachedVersion = parsed.version || "0.0.0";
  return cachedVersion;
}

import { getCliVersion } from "../utils/version";
import { isUpdateAvailable } from "./version";
import { log } from "../cli/output";
import { getOutputMode } from "../cli/output-context";

const DEFAULT_REPO = "Microck/sincronizado";

export interface UpdateInfo {
  current: string;
  latest: string;
  url: string;
}

export async function checkForUpdates(options?: {
  timeoutMs?: number;
  repo?: string;
}): Promise<UpdateInfo | null> {
  const current = await getCliVersion();
  const repo = options?.repo ?? DEFAULT_REPO;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? 2000);

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/releases/latest`,
      {
        headers: { Accept: "application/vnd.github+json" },
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { tag_name?: string; html_url?: string };
    const latest = data.tag_name || "";
    if (!latest) {
      return null;
    }

    if (!isUpdateAvailable(current, latest)) {
      return null;
    }

    return {
      current,
      latest,
      url: data.html_url || `https://github.com/${repo}/releases/latest`,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function notifyIfUpdateAvailable(): Promise<void> {
  const mode = getOutputMode();
  if (mode.quiet || mode.json) {
    return;
  }

  const info = await checkForUpdates();
  if (!info) {
    return;
  }

  log(
    `Update available: ${info.latest} (current ${info.current}). Download: ${info.url}`
  );
}

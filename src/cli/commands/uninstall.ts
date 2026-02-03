import { promises as fs } from "fs";
import { homedir } from "os";
import { join, resolve } from "path";
import { generateSessionId, EXIT_CODES } from "../../utils";
import { terminateSync } from "../../sync";
import { getConfigPath } from "../../config";
import { getDefaultBinDir, removePath } from "../../installer/path";
import { formatError, formatSuccess, log } from "../output";

async function removeIfExists(filePath: string): Promise<boolean> {
  try {
    await fs.rm(filePath, { force: true });
    return true;
  } catch {
    return false;
  }
}

export async function uninstall(): Promise<number> {
  const projectPath = resolve(process.cwd());
  const sessionName = generateSessionId(projectPath);

  await terminateSync(sessionName);

  const configPath = getConfigPath();
  try {
    await fs.rm(configPath, { force: true });
  } catch (error) {
    log(formatError("Failed to remove config", (error as Error).message));
    return EXIT_CODES.GENERAL_ERROR;
  }

  const binDir = getDefaultBinDir();

  // Windows installs use a dedicated directory. On Unix, the default bin dir is
  // often ~/.local/bin (shared with other tooling) so we must not delete it.
  if (process.platform === "win32") {
    await fs.rm(binDir, { recursive: true, force: true });
    await removePath(binDir);
  } else {
    const candidates = new Set<string>();
    const which = Bun.which("sinc");
    if (which) {
      candidates.add(which);
    }
    candidates.add(join(binDir, "sinc"));

    const home = homedir();
    for (const candidate of candidates) {
      // Only auto-remove binaries that live under the user's home directory.
      if (!candidate.startsWith(home)) {
        continue;
      }
      try {
        const stat = await fs.stat(candidate);
        if (!stat.isFile()) {
          continue;
        }
      } catch {
        continue;
      }

      const removed = await removeIfExists(candidate);
      if (!removed) {
        log(
          formatError(
            "Failed to remove sinc binary",
            `Delete it manually: ${candidate}`
          )
        );
        return EXIT_CODES.GENERAL_ERROR;
      }
    }
  }

  log(formatSuccess("sincronizado uninstalled"));
  return EXIT_CODES.SUCCESS;
}

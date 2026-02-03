import { promises as fs } from "fs";
import { resolve } from "path";
import { generateSessionId, EXIT_CODES } from "../../utils";
import { terminateSync } from "../../sync";
import { getConfigPath } from "../../config";
import { getDefaultBinDir, removePath } from "../../installer/path";
import { formatError, formatSuccess, log } from "../output";

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
  await fs.rm(binDir, { recursive: true, force: true });
  await removePath(binDir);

  log(formatSuccess("sincronizado uninstalled"));
  return EXIT_CODES.SUCCESS;
}

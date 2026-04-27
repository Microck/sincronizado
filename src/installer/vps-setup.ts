import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { Config } from "../config/schema";
import { sshExec } from "../connection/ssh";

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`;
}

// Resolves a script path relative to the package installation directory,
// not the current working directory. This fixes EC-58 where `sinc --setup`
// would fail when run from any directory other than the project root.
function getPackageScriptPath(scriptName: string): string {
  const packageDir = dirname(fileURLToPath(import.meta.url));
  return join(packageDir, "..", "..", "scripts", scriptName);
}

export async function runVpsSetup(config: Config): Promise<{ success: boolean; error?: string }> {
  const scriptPath = getPackageScriptPath("setup-vps.sh");
  const script = await fs.readFile(scriptPath, "utf8");
  const encoded = Buffer.from(script, "utf8").toString("base64");
  const workspace = shellQuote(config.sync.remoteBase);
  const command = `SINC_WORKSPACE=${workspace} bash -c "echo ${encoded} | base64 -d | bash"`;

  const result = await sshExec(config, command);
  if (!result.success) {
    return { success: false, error: result.stderr.trim() || result.stdout.trim() };
  }
  return { success: true };
}

export async function runVpsHardening(config: Config): Promise<{ success: boolean; error?: string }> {
  const scriptPath = getPackageScriptPath("harden-vps.sh");
  const script = await fs.readFile(scriptPath, "utf8");
  const encoded = Buffer.from(script, "utf8").toString("base64");
  const command = `bash -c "echo ${encoded} | base64 -d | sudo bash -s -- --yes"`;

  const result = await sshExec(config, command);
  if (!result.success) {
    return { success: false, error: result.stderr.trim() || result.stdout.trim() };
  }
  return { success: true };
}

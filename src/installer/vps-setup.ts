import { promises as fs } from "fs";
import { join } from "path";
import type { Config } from "../config/schema";
import { sshExec } from "../connection/ssh";

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

export async function runVpsSetup(config: Config): Promise<{ success: boolean; error?: string }> {
  const scriptPath = join(process.cwd(), "scripts", "setup-vps.sh");
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

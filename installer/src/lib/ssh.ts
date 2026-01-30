import { spawn } from "child_process";

export interface SSHOptions {
  hostname: string;
  user: string;
  command: string;
  onOutput?: (data: string) => void;
  onError?: (error: Error) => void;
}

export function runSSH({ hostname, user, command, onOutput, onError }: SSHOptions): Promise<number> {
  return new Promise((resolve, reject) => {
    const sshCommand = `ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 ${user}@${hostname} "${command}"`;
    
    const proc = spawn("sh", ["-c", sshCommand], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let output = "";

    proc.stdout?.on("data", (data) => {
      const chunk = data.toString();
      output += chunk;
      onOutput?.(chunk);
    });

    proc.stderr?.on("data", (data) => {
      const chunk = data.toString();
      output += chunk;
      onOutput?.(chunk);
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`SSH command failed with code ${code}: ${output}`));
      }
    });

    proc.on("error", (error) => {
      onError?.(error);
      reject(error);
    });
  });
}

export async function testConnection(hostname: string, user: string): Promise<boolean> {
  try {
    await runSSH({
      hostname,
      user,
      command: "echo 'connected'",
    });
    return true;
  } catch {
    return false;
  }
}

import { homedir } from "os";
import { join } from "path";

export interface DependencyStatus {
  bunInstalled: boolean;
  mutagenInstalled: boolean;
}

export function detectDependencies(): DependencyStatus {
  return {
    bunInstalled: Boolean(Bun.which("bun")),
    mutagenInstalled: Boolean(Bun.which("mutagen")),
  };
}

async function runCommand(command: string[], env?: Record<string, string>): Promise<boolean> {
  const proc = Bun.spawn(command, {
    stdout: "inherit",
    stderr: "inherit",
    env: env ? { ...process.env, ...env } : process.env,
  });
  const exitCode = await proc.exited;
  return exitCode === 0;
}

export async function installBun(): Promise<boolean> {
  if (process.platform === "win32") {
    return runCommand([
      "powershell",
      "-NoProfile",
      "-Command",
      "iwr https://bun.sh/install.ps1 -UseBasicParsing | iex",
    ]);
  }

  return runCommand(["/bin/sh", "-c", "curl -fsSL https://bun.sh/install | bash"]);
}

function mutagenAssetName(): string {
  const arch = process.arch === "arm64" ? "arm64" : "amd64";
  if (process.platform === "win32") {
    return `mutagen_windows_${arch}.zip`;
  }
  if (process.platform === "darwin") {
    return `mutagen_darwin_${arch}.tar.gz`;
  }
  return `mutagen_linux_${arch}.tar.gz`;
}

export async function installMutagen(): Promise<boolean> {
  const asset = mutagenAssetName();
  const url = `https://github.com/mutagen-io/mutagen/releases/latest/download/${asset}`;

  if (process.platform === "win32") {
    const installDir = join(homedir(), "AppData", "Local", "Programs", "mutagen");
    const command = `
      $ErrorActionPreference = 'Stop';
      $zipPath = Join-Path $env:TEMP 'mutagen.zip';
      Invoke-WebRequest -Uri '${url}' -OutFile $zipPath;
      New-Item -ItemType Directory -Force -Path '${installDir}' | Out-Null;
      Expand-Archive -Path $zipPath -DestinationPath '${installDir}' -Force;
    `;
    return runCommand(["powershell", "-NoProfile", "-Command", command]);
  }

  const installDir = join(homedir(), ".local", "bin");
  const command = `mkdir -p ${installDir} && curl -fsSL ${url} | tar -xz -C ${installDir}`;
  return runCommand(["/bin/sh", "-c", command], { PATH: process.env.PATH || "" });
}

export async function ensureDependencies(): Promise<DependencyStatus> {
  const status = detectDependencies();
  if (!status.bunInstalled) {
    status.bunInstalled = await installBun();
  }
  if (!status.mutagenInstalled) {
    status.mutagenInstalled = await installMutagen();
  }
  return status;
}

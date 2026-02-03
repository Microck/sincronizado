import { homedir } from "os";
import { join } from "path";
import { promises as fs } from "fs";
import { dirname } from "path";

export function getDefaultBinDir(): string {
  if (process.platform === "win32") {
    return join(homedir(), "AppData", "Local", "Programs", "sincronizado");
  }
  return join(homedir(), ".local", "bin");
}

async function fileContains(path: string, snippet: string): Promise<boolean> {
  try {
    const contents = await fs.readFile(path, "utf8");
    return contents.includes(snippet);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function appendLine(path: string, line: string): Promise<void> {
  await fs.mkdir(dirname(path), { recursive: true }).catch(() => undefined);
  await fs.appendFile(path, `\n${line}\n`);
}

async function ensureUnixPath(binDir: string): Promise<boolean> {
  const exportLine = `export PATH="${binDir}:$PATH"`;
  const fishLine = `set -gx PATH ${binDir} $PATH`;

  const bashrc = join(homedir(), ".bashrc");
  const zshrc = join(homedir(), ".zshrc");
  const fishConfig = join(homedir(), ".config", "fish", "config.fish");

  let updated = false;
  if (!(await fileContains(bashrc, exportLine))) {
    await appendLine(bashrc, exportLine);
    updated = true;
  }
  if (!(await fileContains(zshrc, exportLine))) {
    await appendLine(zshrc, exportLine);
    updated = true;
  }
  if (!(await fileContains(fishConfig, fishLine))) {
    await appendLine(fishConfig, fishLine);
    updated = true;
  }
  return updated;
}

async function ensureWindowsPath(binDir: string): Promise<boolean> {
  const command = `
    $current = [Environment]::GetEnvironmentVariable('Path','User');
    if ($null -eq $current) { $current = '' }
    if ($current -notlike '*${binDir}*') {
      $newPath = ($current + ';${binDir}').Trim(';');
      [Environment]::SetEnvironmentVariable('Path',$newPath,'User');
      Write-Output 'updated';
    }
  `;

  const proc = Bun.spawn(["powershell", "-NoProfile", "-Command", command], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const output = await new Response(proc.stdout).text();
  await proc.exited;
  return output.includes("updated");
}

export async function ensurePath(binDir: string): Promise<boolean> {
  if (process.platform === "win32") {
    return ensureWindowsPath(binDir);
  }
  await fs.mkdir(binDir, { recursive: true });
  return ensureUnixPath(binDir);
}

async function removePathFromFile(path: string, needle: string): Promise<boolean> {
  try {
    const contents = await fs.readFile(path, "utf8");
    const lines = contents.split(/\r?\n/);
    const filtered = lines.filter((line) => !line.includes(needle));
    if (filtered.length === lines.length) {
      return false;
    }
    await fs.writeFile(path, filtered.join("\n"));
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function removeUnixPath(binDir: string): Promise<boolean> {
  const bashrc = join(homedir(), ".bashrc");
  const zshrc = join(homedir(), ".zshrc");
  const fishConfig = join(homedir(), ".config", "fish", "config.fish");

  const removed = await Promise.all([
    removePathFromFile(bashrc, binDir),
    removePathFromFile(zshrc, binDir),
    removePathFromFile(fishConfig, binDir),
  ]);

  return removed.some(Boolean);
}

async function removeWindowsPath(binDir: string): Promise<boolean> {
  const command = `
    $current = [Environment]::GetEnvironmentVariable('Path','User');
    if ($null -eq $current) { $current = '' }
    if ($current -like '*${binDir}*') {
      $newPath = $current -replace [Regex]::Escape('${binDir}'), '';
      $newPath = ($newPath -replace ';;', ';').Trim(';');
      [Environment]::SetEnvironmentVariable('Path',$newPath,'User');
      Write-Output 'removed';
    }
  `;

  const proc = Bun.spawn(["powershell", "-NoProfile", "-Command", command], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const output = await new Response(proc.stdout).text();
  await proc.exited;
  return output.includes("removed");
}

export async function removePath(binDir: string): Promise<boolean> {
  if (process.platform === "win32") {
    return removeWindowsPath(binDir);
  }
  return removeUnixPath(binDir);
}

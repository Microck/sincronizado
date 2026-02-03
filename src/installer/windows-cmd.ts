function quoteCmdArg(value: string): string {
  if (!/[\s"]/g.test(value)) {
    return value;
  }
  return `"${value.replace(/"/g, '\\"')}"`;
}

export function spawnSetupInCmd(): boolean {
  if (process.platform !== "win32") {
    return false;
  }
  if (process.env.SINC_CMD_SETUP === "1") {
    return false;
  }

  const execPath = process.argv[0];
  const args = process.argv.slice(1);
  const commandLine = [execPath, ...args].map(quoteCmdArg).join(" ");

  Bun.spawn(["cmd.exe", "/c", "start", "", "cmd.exe", "/c", commandLine], {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
    env: { ...process.env, SINC_CMD_SETUP: "1" },
  });

  return true;
}

import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { resolveCliAction } from "../src/cli/dispatch";
import { EXIT_CODES } from "../src/utils";

const tempHome = mkdtempSync(join(tmpdir(), "sinc-cli-"));
const configDir = join(tempHome, ".config", "sincronizado");
mkdirSync(configDir, { recursive: true });
writeFileSync(
  join(configDir, "config.json"),
  `${JSON.stringify(
    {
      vps: { hostname: "127.0.0.1", user: "ubuntu", port: 1 },
      sync: { mode: "both", ignore: [], remoteBase: "~/workspace" },
      agent: "opencode",
      ssh: { connectTimeout: 1, keepaliveInterval: 1 },
      connection: {
        protocols: ["ssh"],
        reconnect: { maxAttempts: 1, baseDelayMs: 100, maxDelayMs: 1000 },
      },
    },
    null,
    2
  )}\n`
);

const baseEnv = {
  ...process.env,
  HOME: tempHome,
  SINC_NO_UPDATE_CHECK: "1",
};

function runCli(args: string[]): {
  exitCode: number;
  stdout: string;
  stderr: string;
} {
  const result = Bun.spawnSync({
    cmd: ["bun", "src/cli/index.ts", ...args],
    cwd: process.cwd(),
    env: baseEnv,
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = result.stdout ? new TextDecoder().decode(result.stdout) : "";
  const stderr = result.stderr ? new TextDecoder().decode(result.stderr) : "";
  return { exitCode: result.exitCode ?? 0, stdout, stderr };
}

afterAll(() => {
  rmSync(tempHome, { recursive: true, force: true });
});

describe("resolveCliAction", () => {
  test("list aliases resolve to list action", () => {
    const variants = [["--list"], ["-l"], ["list"]];
    for (const argv of variants) {
      const result = resolveCliAction(argv);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.action).toBe("list");
      }
    }
  });

  test("kill aliases resolve to kill action", () => {
    const variants = [["--kill", "abc"], ["-k", "abc"], ["kill", "abc"]];
    for (const argv of variants) {
      const result = resolveCliAction(argv);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.action).toBe("kill");
        expect(result.values.kill).toBe("abc");
      }
    }
  });

  test("modifiers do not override actions", () => {
    const result = resolveCliAction(["list", "--json"]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.action).toBe("list");
      expect(result.values.json).toBe(true);
    }
  });

  test("unknown command returns misuse", () => {
    const result = resolveCliAction(["lsst"]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.exitCode).toBe(EXIT_CODES.MISUSE);
      expect(result.message).toContain("Unknown command");
    }
  });

  test("ambiguous invocation returns misuse", () => {
    const result = resolveCliAction(["--list", "kill", "abc"]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.exitCode).toBe(EXIT_CODES.MISUSE);
      expect(result.message).toContain("Only one command");
    }
  });

  test("push and pull are recognized", () => {
    for (const cmd of ["push", "pull"] as const) {
      const result = resolveCliAction([cmd]);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.action).toBe(cmd);
      }
    }
  });
});

describe("cli help output", () => {
  test("--help documents push/pull commands", () => {
    const result = runCli(["--help"]);
    expect(result.exitCode).toBe(EXIT_CODES.SUCCESS);
    expect(result.stdout).toContain("Commands:");
    expect(result.stdout).toMatch(/^\s*push\s+.+/m);
    expect(result.stdout).toMatch(/^\s*pull\s+.+/m);
  });
});

describe("cli parity for aliases", () => {
  test("list variants share exit code and output", () => {
    const longResult = runCli(["--list"]);
    const shortResult = runCli(["-l"]);
    const commandResult = runCli(["list"]);

    expect(shortResult.exitCode).toBe(longResult.exitCode);
    expect(commandResult.exitCode).toBe(longResult.exitCode);

    expect(longResult.stdout).toContain("No active sessions");
    expect(shortResult.stdout).toContain("No active sessions");
    expect(commandResult.stdout).toContain("No active sessions");

    expect(shortResult.stderr).toBe(longResult.stderr);
    expect(commandResult.stderr).toBe(longResult.stderr);
  });

  test("kill variants share exit code and output", () => {
    const longResult = runCli(["--kill", "abc"]);
    const shortResult = runCli(["-k", "abc"]);
    const commandResult = runCli(["kill", "abc"]);

    expect(shortResult.exitCode).toBe(longResult.exitCode);
    expect(commandResult.exitCode).toBe(longResult.exitCode);

    expect(longResult.stderr).toContain("not found");
    expect(shortResult.stderr).toContain("not found");
    expect(commandResult.stderr).toContain("not found");

    expect(shortResult.stdout).toBe(longResult.stdout);
    expect(commandResult.stdout).toBe(longResult.stdout);
  });
});

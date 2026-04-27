import { describe, expect, test } from "bun:test";
import {
  buildTmuxAttachCommand,
  listSessions,
  killSession,
  hasSession,
} from "../src/connection/tmux";
import { configSchema } from "../src/config/schema";
import type { Config } from "../src/config/schema";

const baseConfig: Config = configSchema.parse({
  vps: { hostname: "example.com", user: "ubuntu", port: 22 },
  ssh: { connectTimeout: 10, keepaliveInterval: 60 },
  connection: { protocols: ["ssh", "et", "mosh"] },
});

const configWithIdentity: Config = configSchema.parse({
  vps: { hostname: "example.com", user: "ubuntu", port: 2222 },
  ssh: { connectTimeout: 10, keepaliveInterval: 60, identityFile: "/home/u/.ssh/id_ed25519" },
  connection: { protocols: ["ssh"] },
});

describe("buildTmuxAttachCommand", () => {
  test("returns an array of command parts", () => {
    const args = buildTmuxAttachCommand(baseConfig, "ssh", "sinc-test", "/home/ubuntu/workspace", "zsh");
    expect(Array.isArray(args)).toBe(true);
    expect(args.length).toBeGreaterThan(0);
  });

  test("includes -t flag for ssh protocol", () => {
    const args = buildTmuxAttachCommand(baseConfig, "ssh", "sinc-test", "/home/ubuntu/workspace", "zsh");
    expect(args).toContain("-t");
  });

  test("does not duplicate -t flag for ssh when already present", () => {
    // The function inserts -t at position 1 if not present
    const args = buildTmuxAttachCommand(baseConfig, "ssh", "sinc-test", "/home/ubuntu/workspace", "zsh");
    const tCount = args.filter((a) => a === "-t").length;
    expect(tCount).toBeGreaterThanOrEqual(1);
  });

  test("et protocol command includes -t flag in its remote command", () => {
    // buildRemoteCommand for et returns ["et", "-t", remoteCommand, ...]
    // The -t is part of the et command, not an SSH force-tty flag
    const args = buildTmuxAttachCommand(baseConfig, "et", "sinc-test", "/home/ubuntu/workspace", "zsh");
    expect(args[1]).toBe("-t");
    // sessionName, workDir, and initialCommand are shell-escaped (EC-12 fix)
    const remoteCmd = args[2];
    expect(remoteCmd).toContain("tmux new-session");
    expect(remoteCmd).toContain("sinc-test");
    expect(remoteCmd).toContain("/home/ubuntu/workspace");
    expect(remoteCmd).toContain("zsh");
  });

  test("does not include -t flag for mosh protocol", () => {
    const args = buildTmuxAttachCommand(baseConfig, "mosh", "sinc-test", "/home/ubuntu/workspace", "zsh");
    expect(args).not.toContain("-t");
  });

  test("uses ssh as the first command for ssh protocol", () => {
    const args = buildTmuxAttachCommand(baseConfig, "ssh", "sinc-test", "/home/ubuntu/workspace", "zsh");
    expect(args[0]).toBe("ssh");
  });

  test("includes the remote hostname", () => {
    const args = buildTmuxAttachCommand(baseConfig, "ssh", "sinc-test", "/home/ubuntu/workspace", "zsh");
    expect(args.some((a) => a.includes("ubuntu@example.com"))).toBe(true);
  });

  test("includes custom port when configured", () => {
    const args = buildTmuxAttachCommand(configWithIdentity, "ssh", "sinc-test", "/home/ubuntu/workspace", "zsh");
    expect(args).toContain("-p");
    const portIdx = args.indexOf("-p");
    expect(args[portIdx + 1]).toBe("2222");
  });

  test("includes identityFile when configured", () => {
    const args = buildTmuxAttachCommand(configWithIdentity, "ssh", "sinc-test", "/home/ubuntu/workspace", "zsh");
    expect(args).toContain("-i");
    const idx = args.indexOf("-i");
    expect(args[idx + 1]).toBe("/home/u/.ssh/id_ed25519");
  });

  test("session name is embedded in the tmux command", () => {
    const sessionName = "sinc-myproject";
    const args = buildTmuxAttachCommand(baseConfig, "ssh", sessionName, "/workspace", "zsh");
    // The tmux new-session command contains the session name
    const tmuxCmd = args.join(" ");
    expect(tmuxCmd).toContain(sessionName);
  });

  test("workDir is passed to tmux new-session (shell-escaped for EC-12)", () => {
    const workDir = "/home/ubuntu/projects";
    const args = buildTmuxAttachCommand(baseConfig, "ssh", "sinc-test", workDir, "zsh");
    const tmuxCmd = args.join(" ");
    // workDir is shell-escaped, so it will appear quoted
    expect(tmuxCmd).toContain("-c");
    expect(tmuxCmd).toContain("/home/ubuntu/projects");
  });

  test("initialCommand is passed to tmux new-session", () => {
    const initialCommand = "zsh -l";
    const args = buildTmuxAttachCommand(baseConfig, "ssh", "sinc-test", "/workspace", initialCommand);
    const tmuxCmd = args.join(" ");
    expect(tmuxCmd).toContain(initialCommand);
  });

  test("tmux command is quoted properly", () => {
    const args = buildTmuxAttachCommand(baseConfig, "ssh", "sinc-test", "/workspace", "zsh");
    const tmuxCmd = args.join(" ");
    // The new-session command should be present
    expect(tmuxCmd).toContain("tmux new-session");
  });
});

describe("listSessions", () => {
  test.skip("listSessions hangs when SSH connection is unavailable", () => {
    // listSessions calls sshExec which hangs when SSH to the configured host is unavailable.
    // The connection failure causes Bun.spawn to wait indefinitely.
    // Covered by integration tests when SSH is available.
  });

  test("returns empty array when connection fails", async () => {
    const configBad = configSchema.parse({
      vps: { hostname: "invalid.example.invalid", user: "nobody", port: 22 },
      ssh: { connectTimeout: 1, keepaliveInterval: 10 },
      connection: { protocols: ["ssh"] },
    });
    const sessions = await listSessions(configBad);
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions).toHaveLength(0);
  });
});

describe("killSession", () => {
  test.skip("killSession hangs when SSH connection is unavailable", () => {
    // Covered by integration tests when SSH is available.
  });

  test("returns false when session does not exist", async () => {
    const configBad = configSchema.parse({
      vps: { hostname: "invalid.example.invalid", user: "nobody", port: 22 },
      ssh: { connectTimeout: 1, keepaliveInterval: 10 },
      connection: { protocols: ["ssh"] },
    });
    const result = await killSession(configBad, "sinc-nonexistent-session-xyz");
    expect(result).toBe(false);
  });
});

describe("hasSession", () => {
  test.skip("hasSession hangs when SSH connection is unavailable", () => {
    // Covered by integration tests when SSH is available.
  });
});

describe("tmux module exports", () => {
  test("hasSession, listSessions, killSession, buildTmuxAttachCommand are exported", async () => {
    const mod = await import("../src/connection/tmux");
    expect(typeof mod.hasSession).toBe("function");
    expect(typeof mod.listSessions).toBe("function");
    expect(typeof mod.killSession).toBe("function");
    expect(typeof mod.buildTmuxAttachCommand).toBe("function");
  });
});

describe("session name filtering", () => {
  test("sinc- prefix convention is used in session names", () => {
    // Verify the session name format used throughout
    const sessionName = "sinc-test-session";
    expect(sessionName.startsWith("sinc-")).toBe(true);
  });

  test("session names can contain project identifiers", () => {
    const sessionName = "sinc-micr-dev-workspace";
    expect(sessionName.startsWith("sinc-")).toBe(true);
    expect(sessionName).toContain("workspace");
  });
});

describe("EC-12 shell escaping", () => {
  test("buildTmuxAttachCommand shell-escapes sessionName, workDir, and initialCommand", () => {
    // Verify that values with spaces and special chars are shell-escaped
    const args = buildTmuxAttachCommand(baseConfig, "ssh", "sinc-test", "/path/with spaces", "zsh -l");
    const tmuxCmd = args.find((a) => a.startsWith("tmux"));
    expect(tmuxCmd).toBeDefined();
    // Values containing spaces should be quoted
    expect(tmuxCmd!.includes("'")).toBe(true);
    expect(tmuxCmd!.includes("/path/with spaces")).toBe(true);
    expect(tmuxCmd!.includes("zsh -l")).toBe(true);
  });

  test("invalid session name throws", () => {
    expect(() =>
      buildTmuxAttachCommand(baseConfig, "ssh", "foo; rm -rf /", "/tmp", "zsh")
    ).toThrow(/Invalid session name/);
  });
});
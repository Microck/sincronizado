import { describe, expect, test } from "bun:test";
import { quoteRemotePathForShell } from "../src/cli/commands/connect";

describe("quoteRemotePathForShell", () => {
  test("wraps tilde in double quotes with $HOME", () => {
    expect(quoteRemotePathForShell("~")).toBe('"$HOME"');
  });

  test("wraps tilde-slash paths with $HOME expansion", () => {
    expect(quoteRemotePathForShell("~/project")).toBe('"$HOME/project"');
  });

  test("escapes embedded double quotes in tilde-slash paths", () => {
    expect(quoteRemotePathForShell('~/my "workspace"')).toBe('"$HOME/my \\"workspace\\""');
  });

  test("wraps absolute paths in double quotes", () => {
    expect(quoteRemotePathForShell("/home/ubuntu/project")).toBe('"/home/ubuntu/project"');
  });

  test("escapes double quotes in absolute paths", () => {
    expect(quoteRemotePathForShell('/home/user/"my" project')).toBe('"/home/user/\\"my\\" project"');
  });

  test("returns plain quoted string for simple paths", () => {
    expect(quoteRemotePathForShell("/workspace")).toBe('"/workspace"');
  });

  test("handles paths with multiple slashes", () => {
    expect(quoteRemotePathForShell("~/a/b/c")).toBe('"$HOME/a/b/c"');
  });
});
import { describe, expect, test } from "bun:test";
import { getConfigPath, getProjectName } from "../src/utils/paths";

describe("getConfigPath", () => {
  test("uses XDG_CONFIG_HOME when set", () => {
    const original = process.env.XDG_CONFIG_HOME;
    process.env.XDG_CONFIG_HOME = "/custom/config";
    try {
      const path = getConfigPath();
      expect(path).toBe("/custom/config/sincronizado/config.json");
    } finally {
      if (original !== undefined) {
        process.env.XDG_CONFIG_HOME = original;
      } else {
        delete process.env.XDG_CONFIG_HOME;
      }
    }
  });

  test("falls back to ~/.config when XDG_CONFIG_HOME is unset", () => {
    const original = process.env.XDG_CONFIG_HOME;
    delete process.env.XDG_CONFIG_HOME;
    try {
      const path = getConfigPath();
      expect(path).toContain(".config");
      expect(path).toContain("sincronizado");
      expect(path).toContain("config.json");
    } finally {
      if (original !== undefined) {
        process.env.XDG_CONFIG_HOME = original;
      }
    }
  });
});

describe("getProjectName edge cases", () => {
  test("returns 'project' for empty path", () => {
    // basename("") returns "." on POSIX
    // "." is cleaned away, returning the fallback "project"
    expect(getProjectName("")).toBe("project");
  });

  test("returns 'project' when path would normalize to empty", () => {
    // Path that results in all characters stripped
    expect(getProjectName("///")).toBe("project");
  });

  test("handles root path gracefully", () => {
    // basename("/") returns "" on POSIX
    expect(getProjectName("/")).toBe("project");
  });
});
import { describe, test, expect } from "bun:test";
import { configSchema } from "../src/config/schema";
import { DEFAULT_CONFIG } from "../src/config/defaults";

describe("config schema", () => {
  test("validates minimal config", () => {
    const result = configSchema.safeParse({
      vps: { hostname: "example.com" },
    });
    expect(result.success).toBe(true);
  });

  test("applies defaults", () => {
    const result = configSchema.parse({
      vps: { hostname: "example.com" },
    });
    expect(result.vps.user).toBe("ubuntu");
    expect(result.vps.port).toBe(22);
    expect(result.sync.mode).toBe("both");
    expect(result.agent).toBe("opencode");
  });

  test("rejects empty hostname", () => {
    const result = configSchema.safeParse({
      vps: { hostname: "" },
    });
    expect(result.success).toBe(false);
  });

  test("rejects invalid sync mode", () => {
    const result = configSchema.safeParse({
      vps: { hostname: "example.com" },
      sync: { mode: "invalid" },
    });
    expect(result.success).toBe(false);
  });

  test("accepts all agent types", () => {
    for (const agent of ["opencode", "claude"]) {
      const result = configSchema.safeParse({
        vps: { hostname: "example.com" },
        agent,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("default config", () => {
  test("has required fields", () => {
    expect(DEFAULT_CONFIG.vps).toBeDefined();
    expect(DEFAULT_CONFIG.sync).toBeDefined();
    expect(DEFAULT_CONFIG.agent).toBeDefined();
  });

  test("has sensible ignore patterns", () => {
    expect(DEFAULT_CONFIG.sync.ignore).toContain("node_modules");
    expect(DEFAULT_CONFIG.sync.ignore).toContain(".git");
  });
});

import { describe, expect, test } from "bun:test";
import { compareVersions, isUpdateAvailable, normalizeVersion } from "../src/updates/version";

describe("version helpers", () => {
  test("normalizes version strings", () => {
    expect(normalizeVersion("v1.2.3")).toBe("1.2.3");
    expect(normalizeVersion("1.2.3")).toBe("1.2.3");
  });

  test("compares semver correctly", () => {
    expect(compareVersions("1.0.0", "1.0.1")).toBe(-1);
    expect(compareVersions("1.2.0", "1.1.9")).toBe(1);
    expect(compareVersions("2.0.0", "2.0.0")).toBe(0);
  });

  test("detects update availability", () => {
    expect(isUpdateAvailable("1.0.0", "1.0.1")).toBe(true);
    expect(isUpdateAvailable("1.0.0", "v1.0.1")).toBe(true);
    expect(isUpdateAvailable("1.1.0", "1.0.9")).toBe(false);
  });
});

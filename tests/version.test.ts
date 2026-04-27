import { describe, expect, test } from "bun:test";
import { getCliVersion } from "../src/utils/version";

describe("getCliVersion", () => {
  test("returns a non-empty version string from package.json", async () => {
    const version = await getCliVersion();
    expect(typeof version).toBe("string");
    expect(version.length).toBeGreaterThan(0);
  });

  test("version matches semver format", async () => {
    const version = await getCliVersion();
    // Matches typical semver: 1.0.0, 0.1.2, 10.20.30
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
  });

  test("does not include leading v prefix", async () => {
    const version = await getCliVersion();
    expect(version).not.toMatch(/^v\d/);
  });

  test("caches result on repeated calls", async () => {
    const v1 = await getCliVersion();
    const v2 = await getCliVersion();
    expect(v1).toBe(v2);
  });
});
import { describe, test, expect } from "bun:test";
import { generateSessionId } from "../src/utils/hash";
import { getProjectName } from "../src/utils/paths";

describe("generateSessionId", () => {
  test("returns format sinc-{project}-{hash}", () => {
    const id = generateSessionId("/home/user/myproject");
    expect(id).toMatch(/^sinc-[a-z0-9-]+-[a-f0-9]{6}$/);
  });

  test("includes project name", () => {
    const id = generateSessionId("/home/user/myproject");
    expect(id).toContain("myproject");
  });

  test("is deterministic for same path", () => {
    const id1 = generateSessionId("/home/user/myproject");
    const id2 = generateSessionId("/home/user/myproject");
    expect(id1).toBe(id2);
  });

  test("is different for different paths", () => {
    const id1 = generateSessionId("/home/user/project-a");
    const id2 = generateSessionId("/home/user/project-b");
    expect(id1).not.toBe(id2);
  });

  test("differentiates same project name in different locations", () => {
    const id1 = generateSessionId("/home/user/work/myproject");
    const id2 = generateSessionId("/home/user/personal/myproject");
    expect(id1).not.toBe(id2);
  });

  test("handles paths with special characters", () => {
    const id = generateSessionId("/home/user/my-project_123");
    expect(id).toMatch(/^sinc-[a-z0-9-]+-[a-f0-9]{6}$/);
  });
});

describe("getProjectName", () => {
  test("extracts folder name", () => {
    expect(getProjectName("/home/user/myproject")).toBe("myproject");
  });

  test("lowercases name", () => {
    expect(getProjectName("/home/user/MyProject")).toBe("myproject");
  });

  test("converts spaces to hyphens", () => {
    expect(getProjectName("/home/user/My Project")).toBe("my-project");
  });

  test("removes special characters", () => {
    expect(getProjectName("/home/user/my@project!")).toBe("myproject");
  });
});

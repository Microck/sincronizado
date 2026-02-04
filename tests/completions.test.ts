import { describe, test, expect } from "bun:test";
import { getCompletionScript } from "../src/cli/completions";

const requiredFlags = [
  "--help",
  "--version",
  "--resume",
  "--list",
  "--kill",
  "--setup",
  "--uninstall",
  "--quiet",
  "--verbose",
  "--json",
  "--completions",
  "-l",
  "-k",
];

describe("completion scripts", () => {
  test("bash script includes flags", () => {
    const script = getCompletionScript("bash");
    expect(script).toContain("sinc");
    for (const flag of requiredFlags) {
      expect(script).toContain(flag);
    }
  });

  test("zsh script includes flags", () => {
    const script = getCompletionScript("zsh");
    expect(script).toContain("sinc");
    for (const flag of requiredFlags) {
      expect(script).toContain(flag);
    }
  });

  test("fish script includes flags", () => {
    const script = getCompletionScript("fish");
    expect(script).toContain("sinc");
    for (const flag of requiredFlags) {
      expect(script).toContain(flag);
    }
  });
});

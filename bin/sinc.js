#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cliPath = fileURLToPath(new URL("../src/cli/index.ts", import.meta.url));

const result = spawnSync("bun", ["run", cliPath, ...process.argv.slice(2)], {
  stdio: "inherit",
});

if (result.error) {
  // Most commonly: bun isn't installed or isn't on PATH.
  // Keep this short: npm users should already have Node, but not necessarily Bun.
  console.error("sincronizado: bun is required to run the CLI (install bun, then retry)");
  process.exit(1);
}

process.exit(result.status ?? 1);

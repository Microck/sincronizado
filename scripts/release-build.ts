import { mkdir } from "fs/promises";
import { join } from "path";

const targets = [
  { bun: "bun-linux-x64", os: "linux", arch: "x64" },
  { bun: "bun-linux-arm64", os: "linux", arch: "arm64" },
  { bun: "bun-darwin-x64", os: "darwin", arch: "x64" },
  { bun: "bun-darwin-arm64", os: "darwin", arch: "arm64" },
  { bun: "bun-windows-x64", os: "windows", arch: "x64", ext: ".exe" },
  { bun: "bun-windows-arm64", os: "windows", arch: "arm64", ext: ".exe" },
];

async function runBuild(target: (typeof targets)[number]): Promise<void> {
  const distDir = join(process.cwd(), "dist");
  await mkdir(distDir, { recursive: true });

  const outputName = `sinc-${target.os}-${target.arch}${target.ext ?? ""}`;
  const outputPath = join(distDir, outputName);

  const proc = Bun.spawn([
    "bun",
    "build",
    "./src/cli/index.ts",
    "--compile",
    `--target=${target.bun}`,
    `--outfile=${outputPath}`,
  ], {
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`Build failed for ${target.bun}`);
  }
}

for (const target of targets) {
  // eslint-disable-next-line no-console
  console.log(`Building ${target.bun}...`);
  await runBuild(target);
}

console.log("Release builds complete.");

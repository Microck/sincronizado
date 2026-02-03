import { getProjectName } from "./paths";

export function generateSessionId(absolutePath: string): string {
  const projectName = getProjectName(absolutePath);
  const hash = new Bun.CryptoHasher("sha256")
    .update(absolutePath)
    .digest("hex")
    .slice(0, 6);

  return `sinc-${projectName}-${hash}`;
}

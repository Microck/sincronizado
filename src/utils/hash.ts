import { getProjectName } from "./paths";

/**
 * Generates a unique session ID for a project based on its absolute path.
 * Combines a sanitized project name with a truncated SHA-256 hash of the full path.
 * @param absolutePath - The absolute path to the project directory.
 * @returns A session identifier string (e.g. "sinc-my-project-a3f2b1").
 */
export function generateSessionId(absolutePath: string): string {
  const projectName = getProjectName(absolutePath);
  const hash = new Bun.CryptoHasher("sha256")
    .update(absolutePath)
    .digest("hex")
    .slice(0, 6);

  return `sinc-${projectName}-${hash}`;
}

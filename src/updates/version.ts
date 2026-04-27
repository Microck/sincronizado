/**
 * Normalizes a version string by removing the 'v' prefix and stripping
 * any metadata (e.g., "1.0.0-beta" -> "1.0.0").
 * @param value - The version string to normalize
 * @returns The normalized version string
 */
export function normalizeVersion(value: string): string {
  const trimmed = value.trim();
  const noPrefix = trimmed.startsWith("v") ? trimmed.slice(1) : trimmed;
  const withoutMeta = noPrefix.split("-")[0];
  return withoutMeta;
}

function parseVersion(value: string): number[] {
  return normalizeVersion(value)
    .split(".")
    .map((part) => Number(part))
    .map((part) => (Number.isFinite(part) ? part : 0));
}

/**
 * Compares two version strings.
 * @param left - The first version to compare
 * @param right - The second version to compare
 * @returns -1 if left < right, 1 if left > right, 0 if equal
 */
export function compareVersions(left: string, right: string): number {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let i = 0; i < maxLength; i += 1) {
    const l = leftParts[i] ?? 0;
    const r = rightParts[i] ?? 0;
    if (l < r) return -1;
    if (l > r) return 1;
  }
  return 0;
}

/**
 * Checks if an update is available by comparing versions.
 * @param current - The current version
 * @param latest - The latest available version
 * @returns True if an update is available (current < latest)
 */
export function isUpdateAvailable(current: string, latest: string): boolean {
  return compareVersions(current, latest) < 0;
}

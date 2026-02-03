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

export function isUpdateAvailable(current: string, latest: string): boolean {
  return compareVersions(current, latest) < 0;
}

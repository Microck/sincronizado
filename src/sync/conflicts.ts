export interface SyncConflict {
  path: string;
  alphaVersion?: string;
  betaVersion?: string;
}

export function extractConflicts(sessionJson: unknown): SyncConflict[] {
  let data: any = sessionJson;

  if (typeof sessionJson === "string") {
    try {
      data = JSON.parse(sessionJson);
    } catch {
      return [];
    }
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const sessions = Array.isArray(data.sessions) ? data.sessions : [];
  const conflicts: SyncConflict[] = [];

  for (const session of sessions) {
    if (!session || typeof session !== "object") {
      continue;
    }
    const sessionConflicts = Array.isArray(session.conflicts) ? session.conflicts : [];
    for (const conflict of sessionConflicts) {
      if (!conflict || typeof conflict !== "object") {
        continue;
      }
      const path = conflict.path || conflict.relativePath || conflict.file;
      if (!path || typeof path !== "string") {
        continue;
      }
      const alphaVersion =
        conflict.alphaVersion || conflict.alpha?.version || conflict.alpha?.path;
      const betaVersion =
        conflict.betaVersion || conflict.beta?.version || conflict.beta?.path;
      conflicts.push({
        path,
        alphaVersion: typeof alphaVersion === "string" ? alphaVersion : undefined,
        betaVersion: typeof betaVersion === "string" ? betaVersion : undefined,
      });
    }
  }

  return conflicts;
}

export function formatConflicts(conflicts: SyncConflict[]): string {
  if (conflicts.length === 0) {
    return "No conflicts";
  }

  return conflicts
    .map((conflict) => {
      const versions = [
        conflict.alphaVersion ? `alpha: ${conflict.alphaVersion}` : null,
        conflict.betaVersion ? `beta: ${conflict.betaVersion}` : null,
      ].filter(Boolean);
      if (versions.length === 0) {
        return conflict.path;
      }
      return `${conflict.path} (${versions.join(", ")})`;
    })
    .join("\n");
}

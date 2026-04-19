export interface SyncConflict {
  path: string;
  alphaVersion?: string;
  betaVersion?: string;
}

type ConflictRecord = Record<string, unknown> & {
  path?: string;
  relativePath?: string;
  file?: string;
  alphaVersion?: unknown;
  betaVersion?: unknown;
  alpha?: Record<string, unknown>;
  beta?: Record<string, unknown>;
  conflicts?: unknown[];
};

type SessionRecord = Record<string, unknown> & {
  conflicts?: unknown[];
};

function toConflictRecords(raw: unknown): ConflictRecord[] {
  return Array.isArray(raw) ? (raw.filter((item): item is ConflictRecord =>
    item != null && typeof item === "object" && !Array.isArray(item)
  )) : [];
}

export function extractConflicts(sessionJson: unknown): SyncConflict[] {
  let data: unknown = sessionJson;

  if (typeof sessionJson === "string") {
    try {
      data = JSON.parse(sessionJson);
    } catch {
      return [];
    }
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return [];
  }

  const dataObj = data as Record<string, unknown>;
  const sessions: SessionRecord[] = Array.isArray(dataObj.sessions)
    ? dataObj.sessions.filter((s): s is SessionRecord =>
        s != null && typeof s === "object" && !Array.isArray(s)
      )
    : [];
  const conflicts: SyncConflict[] = [];

  for (const session of sessions) {
    const sessionConflicts = toConflictRecords(session.conflicts);
    for (const conflict of sessionConflicts) {
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

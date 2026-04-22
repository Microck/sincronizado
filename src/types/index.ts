export type { Config } from "../config/schema";
export type { ConnectionState, ConnectionStatus } from "../connection/state";
export type { SyncStatus } from "../sync/mutagen";

/**
 * Metadata for a synchronized session/project.
 */
export interface SessionInfo {
  name: string;
  projectPath: string;
  remotePath: string;
  connected: boolean;
  syncing: boolean;
}

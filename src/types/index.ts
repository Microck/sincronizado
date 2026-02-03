export type { Config } from "../config/schema";
export type { ConnectionState, ConnectionStatus } from "../connection/state";
export type { SyncStatus } from "../sync/mutagen";

export interface SessionInfo {
  name: string;
  projectPath: string;
  remotePath: string;
  connected: boolean;
  syncing: boolean;
}

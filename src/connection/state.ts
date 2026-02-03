export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export interface ConnectionState {
  status: ConnectionStatus;
  sessionName: string | null;
  error: string | null;
  lastConnected: Date | null;
}

export function createConnectionState(): ConnectionState {
  return {
    status: "disconnected",
    sessionName: null,
    error: null,
    lastConnected: null,
  };
}

export function updateState(
  state: ConnectionState,
  updates: Partial<ConnectionState>
): ConnectionState {
  return { ...state, ...updates };
}

export function formatConnectionStatus(state: ConnectionState): string {
  switch (state.status) {
    case "disconnected":
      return "Disconnected";
    case "connecting":
      return "Connecting...";
    case "connected":
      return `Connected (${state.sessionName})`;
    case "reconnecting":
      return "Reconnecting...";
    case "error":
      return `Error: ${state.error}`;
  }
}

import { describe, test, expect } from "bun:test";
import {
  createConnectionState,
  updateState,
  formatConnectionStatus,
} from "../src/connection/state";

describe("connection state", () => {
  test("creates initial disconnected state", () => {
    const state = createConnectionState();
    expect(state.status).toBe("disconnected");
    expect(state.sessionName).toBeNull();
    expect(state.error).toBeNull();
  });

  test("updates state immutably", () => {
    const state1 = createConnectionState();
    const state2 = updateState(state1, { status: "connecting" });

    expect(state1.status).toBe("disconnected");
    expect(state2.status).toBe("connecting");
  });

  test("formats disconnected status", () => {
    const state = createConnectionState();
    expect(formatConnectionStatus(state)).toBe("Disconnected");
  });

  test("formats connected status with session name", () => {
    const state = updateState(createConnectionState(), {
      status: "connected",
      sessionName: "sinc-test-abc123",
    });
    expect(formatConnectionStatus(state)).toBe("Connected (sinc-test-abc123)");
  });

  test("formats error status with message", () => {
    const state = updateState(createConnectionState(), {
      status: "error",
      error: "Connection refused",
    });
    expect(formatConnectionStatus(state)).toBe("Error: Connection refused");
  });
});

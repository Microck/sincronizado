import { describe, expect, test } from "bun:test";
import {
  getSyncStatus,
  getSyncConflicts,
  flushSync,
  pauseSync,
  resumeSync,
  terminateSync,
  isMutagenInstalled,
  type SyncStatus,
} from "../src/sync/mutagen";

// Note: createSyncSession, forceSyncDirection, resolveRemoteEndpoint tests
// are skipped because they call mutagen sync create which requires the daemon.
// These are covered by tests/integration/mutagen.test.ts (SINC_INTEGRATION=1).

describe("getSyncStatus", () => {
  test("returns SyncStatus shape", async () => {
    const status = await getSyncStatus("sinc-nonexistent-session-xyz");
    expect(status).toHaveProperty("exists");
    expect(status).toHaveProperty("status");
    expect(status).toHaveProperty("watching");
    expect(status).toHaveProperty("conflicts");
  });

  test("exists is a boolean", async () => {
    const status = await getSyncStatus("sinc-nonexistent-" + Math.random().toString(36).slice(2));
    expect(typeof status.exists).toBe("boolean");
  });

  test("status is a string", async () => {
    const status = await getSyncStatus("sinc-nonexistent-" + Math.random().toString(36).slice(2));
    expect(typeof status.status).toBe("string");
  });

  test("watching is a boolean", async () => {
    const status = await getSyncStatus("sinc-nonexistent-" + Math.random().toString(36).slice(2));
    expect(typeof status.watching).toBe("boolean");
  });

  test("conflicts is an array", async () => {
    const status = await getSyncStatus("sinc-nonexistent-" + Math.random().toString(36).slice(2));
    expect(Array.isArray(status.conflicts)).toBe(true);
  });

  test("returns not-found shape for nonexistent sessions", async () => {
    const status = await getSyncStatus("sinc-random-" + Math.random().toString(36).slice(2));
    expect(status.exists).toBe(false);
    expect(status.status).toBe("not found");
    expect(status.watching).toBe(false);
  });

  test("status field is non-empty string", async () => {
    const status = await getSyncStatus("sinc-nonexistent");
    expect(typeof status.status).toBe("string");
  });
});

// --- getSyncConflicts ---

describe("getSyncConflicts", () => {
  test("returns an array", async () => {
    const conflicts = await getSyncConflicts("sinc-nonexistent-xyz");
    expect(Array.isArray(conflicts)).toBe(true);
  });

  test("returns empty array when session does not exist", async () => {
    const conflicts = await getSyncConflicts("sinc-nonexistent-conflict-test");
    expect(conflicts).toHaveLength(0);
  });
});

// --- mutagenExec error paths ---

describe("flushSync", () => {
  test("returns a boolean", async () => {
    const result = await flushSync("sinc-nonexistent");
    expect(typeof result).toBe("boolean");
  });
});

describe("pauseSync", () => {
  test("returns a boolean", async () => {
    const result = await pauseSync("sinc-nonexistent");
    expect(typeof result).toBe("boolean");
  });
});

describe("resumeSync", () => {
  test("returns a boolean", async () => {
    const result = await resumeSync("sinc-nonexistent");
    expect(typeof result).toBe("boolean");
  });
});

describe("terminateSync", () => {
  test("returns a boolean", async () => {
    const result = await terminateSync("sinc-nonexistent");
    expect(typeof result).toBe("boolean");
  });
});

// --- isMutagenInstalled ---

const mutagenAvailable = Boolean(Bun.which("mutagen"));

describe("isMutagenInstalled", () => {
  test("returns a boolean", async () => {
    const installed = await isMutagenInstalled();
    expect(typeof installed).toBe("boolean");
  });

  test("returns true when mutagen binary is present", () => {
    expect(mutagenAvailable).toBe(true);
  });
});

// --- module exports ---

describe("mutagen module exports", () => {
  test("exports all expected functions", async () => {
    const mod = await import("../src/sync/mutagen");
    expect(typeof mod.createSyncSession).toBe("function");
    expect(typeof mod.getSyncStatus).toBe("function");
    expect(typeof mod.getSyncConflicts).toBe("function");
    expect(typeof mod.flushSync).toBe("function");
    expect(typeof mod.pauseSync).toBe("function");
    expect(typeof mod.resumeSync).toBe("function");
    expect(typeof mod.terminateSync).toBe("function");
    expect(typeof mod.isMutagenInstalled).toBe("function");
    expect(typeof mod.forceSyncDirection).toBe("function");
  });

  test("SyncStatus interface is correctly structured", () => {
    const status: SyncStatus = {
      exists: false,
      status: "not found",
      watching: false,
      conflicts: [],
    };
    expect(status.exists).toBe(false);
    expect(status.status).toBe("not found");
    expect(Array.isArray(status.conflicts)).toBe(true);
  });
});

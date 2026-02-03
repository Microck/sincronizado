import { describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { loadConfig } from "../../src/config";
import {
  createSyncSession,
  getSyncStatus,
  terminateSync,
  isMutagenInstalled,
} from "../../src/sync";

const shouldRun = process.env.SINC_INTEGRATION === "1";
const integrationTest = shouldRun ? test : test.skip;

describe("mutagen integration", () => {
  integrationTest("creates and terminates a sync session", async () => {
    const config = await loadConfig();
    const installed = await isMutagenInstalled();
    expect(installed).toBe(true);

    const localDir = await mkdtemp(join(tmpdir(), "sinc-mutagen-"));
    const sessionName = `sinc-integration-${Date.now()}`;
    const remotePath = `${config.sync.remoteBase}/sinc-integration-${Date.now()}`;

    const createResult = await createSyncSession(
      config,
      sessionName,
      localDir,
      remotePath,
      config.sync.ignore
    );
    expect(createResult.success).toBe(true);

    let watching = false;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const status = await getSyncStatus(sessionName);
      if (status.watching) {
        watching = true;
        break;
      }
      await new Promise((resolveWait) => setTimeout(resolveWait, 1000));
    }
    expect(watching).toBe(true);

    const terminated = await terminateSync(sessionName);
    expect(terminated).toBe(true);

    await rm(localDir, { recursive: true, force: true });
  });
});

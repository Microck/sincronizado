import { describe, expect, test } from "bun:test";
import { loadConfig } from "../../src/config";
import { testConnection } from "../../src/connection";

const shouldRun = process.env.SINC_INTEGRATION === "1";
const integrationTest = shouldRun ? test : test.skip;

describe("ssh integration", () => {
  integrationTest("connects to configured host", async () => {
    const config = await loadConfig();
    const result = await testConnection(config);
    expect(result.success).toBe(true);
  });
});

import type { Config } from "./schema";

export const DEFAULT_CONFIG: Config = {
  vps: {
    hostname: "localhost",
    user: "ubuntu",
    port: 22,
  },
  sync: {
    mode: "both",
    ignore: ["node_modules", ".venv", ".git", "__pycache__", ".DS_Store"],
    remoteBase: "~/workspace",
  },
  agent: "opencode",
  ssh: {
    connectTimeout: 10,
    keepaliveInterval: 60,
  },
  connection: {
    protocols: ["ssh", "et", "mosh"],
    reconnect: {
      maxAttempts: 5,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
    },
  },
};

import {
  cancel,
  confirm,
  intro,
  isCancel,
  outro,
  select,
  spinner,
  text,
} from "@clack/prompts";
import { homedir } from "os";
import { dirname, join } from "path";
import { promises as fs } from "fs";
import { configSchema, type Config } from "../config/schema";
import { DEFAULT_CONFIG, saveConfig } from "../config";
import { testConnection } from "../connection/ssh";
import { ensureDependencies } from "./deps";
import { ensurePath, getDefaultBinDir } from "./path";
import { runVpsSetup } from "./vps-setup";

function resolveHomePath(value: string): string {
  if (value.startsWith("~/")) {
    return join(homedir(), value.slice(2));
  }
  return value;
}

function parseCommaList(value: string | null): string[] | undefined {
  if (!value) {
    return undefined;
  }
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

async function generateSshKey(path: string): Promise<{ success: boolean; error?: string }> {
  if (!Bun.which("ssh-keygen")) {
    return { success: false, error: "ssh-keygen not found on PATH" };
  }

  const resolved = resolveHomePath(path);
  await fs.mkdir(dirname(resolved), { recursive: true });

  const proc = Bun.spawn(
    ["ssh-keygen", "-t", "ed25519", "-f", resolved, "-N", "", "-q"],
    { stdout: "pipe", stderr: "pipe" }
  );

  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    return { success: false, error: stderr.trim() || "ssh-keygen failed" };
  }
  return { success: true };
}

export async function runSetupTui(): Promise<Config | null> {
  intro("sincronizado setup");

  const agent = await select({
    message: "Select AI agent",
    options: [
      { value: "opencode", label: "OpenCode" },
      { value: "claude", label: "Claude" },
    ],
    initialValue: "opencode",
  });
  if (isCancel(agent)) {
    cancel("Setup cancelled");
    return null;
  }

  const syncMode = await select({
    message: "Sync mode",
    options: [
      { value: "both", label: "Both (recommended)" },
      { value: "pull", label: "Pull only" },
      { value: "push", label: "Push only" },
      { value: "none", label: "No sync" },
    ],
    initialValue: "both",
  });
  if (isCancel(syncMode)) {
    cancel("Setup cancelled");
    return null;
  }

  const hostname = await text({
    message: "VPS hostname",
    placeholder: "example.com",
    validate: (value) => (value ? undefined : "Hostname is required"),
  });
  if (isCancel(hostname)) {
    cancel("Setup cancelled");
    return null;
  }

  const user = await text({
    message: "VPS user",
    initialValue: "ubuntu",
    validate: (value) => (value ? undefined : "User is required"),
  });
  if (isCancel(user)) {
    cancel("Setup cancelled");
    return null;
  }

  const portInput = await text({
    message: "VPS SSH port",
    initialValue: "22",
    validate: (value) => {
      if (!value) return "Port is required";
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return "Port must be a positive integer";
      }
      return undefined;
    },
  });
  if (isCancel(portInput)) {
    cancel("Setup cancelled");
    return null;
  }

  const sshChoice = await select({
    message: "SSH key",
    options: [
      { value: "existing", label: "Use existing key" },
      { value: "generate", label: "Generate new key" },
    ],
    initialValue: "existing",
  });
  if (isCancel(sshChoice)) {
    cancel("Setup cancelled");
    return null;
  }

  let identityFile: string | undefined;
  if (sshChoice === "existing") {
    const keyPath = await text({
      message: "SSH key path",
      initialValue: "~/.ssh/id_ed25519",
      validate: (value) => (value ? undefined : "Key path is required"),
    });
    if (isCancel(keyPath)) {
      cancel("Setup cancelled");
      return null;
    }
    identityFile = resolveHomePath(keyPath);
  } else {
    const keyPath = await text({
      message: "New SSH key path",
      initialValue: "~/.ssh/sinc_ed25519",
      validate: (value) => (value ? undefined : "Key path is required"),
    });
    if (isCancel(keyPath)) {
      cancel("Setup cancelled");
      return null;
    }
    identityFile = resolveHomePath(keyPath);
    const gen = spinner();
    gen.start("Generating SSH key...");
    const result = await generateSshKey(identityFile);
    if (!result.success) {
      gen.stop("SSH key generation failed");
      cancel(result.error || "Unable to generate SSH key");
      return null;
    }
    gen.stop("SSH key generated");
  }

  const remoteBase = await text({
    message: "VPS workspace path",
    initialValue: "~/workspace",
    validate: (value) => (value ? undefined : "Workspace path is required"),
  });
  if (isCancel(remoteBase)) {
    cancel("Setup cancelled");
    return null;
  }

  const ignoreInput = await text({
    message: "Additional ignore patterns (comma-separated)",
    placeholder: "dist, .env.local",
  });
  if (isCancel(ignoreInput)) {
    cancel("Setup cancelled");
    return null;
  }

  const ignorePatterns = parseCommaList(ignoreInput);
  const mergedIgnore = ignorePatterns
    ? Array.from(new Set([...DEFAULT_CONFIG.sync.ignore, ...ignorePatterns]))
    : undefined;

  const config = configSchema.parse({
    vps: {
      hostname,
      user,
      port: Number(portInput),
    },
    sync: {
      mode: syncMode,
      remoteBase,
      ...(mergedIgnore ? { ignore: mergedIgnore } : {}),
    },
    agent,
    ssh: {
      connectTimeout: 10,
      keepaliveInterval: 60,
      ...(identityFile ? { identityFile } : {}),
    },
  });

  const connectionCheck = spinner();
  connectionCheck.start("Testing VPS connection...");
  const result = await testConnection(config);
  if (!result.success) {
    connectionCheck.stop("Connection failed");
    cancel(result.error || "Unable to connect to VPS");
    return null;
  }
  connectionCheck.stop("Connection verified");

  await saveConfig(config);

  const depsSpinner = spinner();
  depsSpinner.start("Ensuring dependencies...");
  const deps = await ensureDependencies();
  if (!deps.bunInstalled || !deps.mutagenInstalled) {
    depsSpinner.stop("Dependency installation failed");
    cancel("Unable to install required dependencies");
    return null;
  }
  depsSpinner.stop("Dependencies ready");

  const pathSpinner = spinner();
  pathSpinner.start("Updating PATH...");
  await ensurePath(getDefaultBinDir());
  pathSpinner.stop("PATH updated");

  const runSetup = await confirm({
    message: "Run VPS setup script now?",
    initialValue: true,
  });
  if (isCancel(runSetup)) {
    cancel("Setup cancelled");
    return null;
  }
  if (runSetup) {
    const vpsSpinner = spinner();
    vpsSpinner.start("Running VPS setup...");
    const vpsResult = await runVpsSetup(config);
    if (!vpsResult.success) {
      vpsSpinner.stop("VPS setup failed");
      cancel(vpsResult.error || "Unable to run VPS setup");
      return null;
    }
    vpsSpinner.stop("VPS setup complete");
  }

  outro("Setup complete. You can now run `sinc`. ");
  return config;
}

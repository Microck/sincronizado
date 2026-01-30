export interface InstallFlags {
  mode: "minimal" | "standard" | "full" | "custom";
  withKimaki?: boolean;
  withLunaroute?: boolean;
  withWorktreeSession?: boolean;
  withSessionHandoff?: boolean;
  withAgentOfEmpires?: boolean;
  noAgentOS?: boolean;
  noCcmanager?: boolean;
  noPlugins?: boolean;
}

export function generateInstallScript(flags: InstallFlags): string {
  const parts: string[] = ["#!/bin/bash", "set -euo pipefail", ""];

  parts.push(`./setup-vps.sh --mode=${flags.mode}`);

  if (flags.withKimaki) parts.push("--with-kimaki");
  if (flags.withLunaroute) parts.push("--with-lunaroute");
  if (flags.withWorktreeSession) parts.push("--with-worktree-session");
  if (flags.withSessionHandoff) parts.push("--with-session-handoff");
  if (flags.withAgentOfEmpires) parts.push("--with-agent-of-empires");
  if (flags.noAgentOS) parts.push("--no-agent-os");
  if (flags.noCcmanager) parts.push("--no-ccmanager");
  if (flags.noPlugins) parts.push("--no-plugins");

  return parts.join(" ");
}

export function buildFlags(config: InstallFlags): string {
  const flags: string[] = [`--mode=${config.mode}`];

  if (config.withKimaki) flags.push("--with-kimaki");
  if (config.withLunaroute) flags.push("--with-lunaroute");
  if (config.withWorktreeSession) flags.push("--with-worktree-session");
  if (config.withSessionHandoff) flags.push("--with-session-handoff");
  if (config.withAgentOfEmpires) flags.push("--with-agent-of-empires");
  if (config.noAgentOS) flags.push("--no-agent-os");
  if (config.noCcmanager) flags.push("--no-ccmanager");
  if (config.noPlugins) flags.push("--no-plugins");

  return flags.join(" ");
}

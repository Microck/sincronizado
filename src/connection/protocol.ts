import type { Config } from "../config/schema";

export type ConnectionProtocol = "ssh" | "et" | "mosh";

const protocolBinary: Record<ConnectionProtocol, string> = {
  ssh: "ssh",
  et: "et",
  mosh: "mosh",
};

export function detectAvailableProtocols(
  protocols: ConnectionProtocol[] = ["ssh", "et", "mosh"]
): ConnectionProtocol[] {
  return protocols.filter((protocol) => Boolean(Bun.which(protocolBinary[protocol])));
}

export function selectProtocol(config: Config): ConnectionProtocol {
  const available = detectAvailableProtocols(config.connection.protocols);
  if (available.length > 0) {
    return available[0];
  }
  return config.connection.protocols[0] ?? "ssh";
}

export function buildRemoteCommand(
  config: Config,
  protocol: ConnectionProtocol,
  remoteCommand: string
): string[] {
  const host = `${config.vps.user}@${config.vps.hostname}`;
  switch (protocol) {
    case "et":
      return ["et", "-t", remoteCommand, "-p", String(config.vps.port), host];
    case "mosh":
      return ["mosh", "-p", String(config.vps.port), host, "--", remoteCommand];
    case "ssh":
    default:
      return [
        "ssh",
        "-o",
        `ServerAliveInterval=${config.ssh.keepaliveInterval}`,
        "-o",
        "ServerAliveCountMax=3",
        "-p",
        String(config.vps.port),
        host,
        remoteCommand,
      ];
  }
}

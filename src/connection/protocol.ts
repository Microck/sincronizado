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

export class ProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProtocolError";
  }
}

export function selectProtocol(config: Config): ConnectionProtocol {
  const available = detectAvailableProtocols(config.connection.protocols);
  if (available.length > 0) {
    return available[0];
  }
  const requested = config.connection.protocols.join(", ");
  throw new ProtocolError(
    `None of the configured connection protocols (${requested}) are installed on this system.`
  );
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
    case "mosh": {
      // mosh uses SSH for the initial handshake. The `-p` flag sets the UDP port
      // range (default 60000-61000), NOT the SSH port. To specify a custom SSH
      // port, use --ssh="ssh -p <port>". We omit -p entirely here so mosh uses its
      // default UDP range, and pass the SSH port via --ssh.
      const sshCmd =
        config.vps.port === 22
          ? "ssh"
          : `ssh -p ${config.vps.port}`;
      return ["mosh", `--ssh="${sshCmd}"`, host, "--", remoteCommand];
    }
    case "ssh":
    default:
      return [
        "ssh",
        "-o",
        `ServerAliveInterval=${config.ssh.keepaliveInterval}`,
        "-o",
        "ServerAliveCountMax=3",
        ...(config.ssh.identityFile ? ["-i", config.ssh.identityFile] : []),
        "-p",
        String(config.vps.port),
        host,
        remoteCommand,
      ];
  }
}

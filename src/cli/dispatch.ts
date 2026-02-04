import { parseArgs } from "util";
import { EXIT_CODES } from "../utils";
import { formatError } from "./output";

export type CliAction =
  | "help"
  | "version"
  | "completions"
  | "setup"
  | "uninstall"
  | "list"
  | "kill"
  | "connect";

export interface CliValues {
  help: boolean;
  version: boolean;
  resume: boolean;
  quiet: boolean;
  verbose: boolean;
  json: boolean;
  completions?: string;
  list: boolean;
  kill?: string;
  setup: boolean;
  uninstall: boolean;
}

export type CliActionResult =
  | { ok: true; action: CliAction; values: CliValues }
  | { ok: false; exitCode: number; message: string };

function misuse(message: string, includeHelpHint = true): CliActionResult {
  const suffix = includeHelpHint ? "\nRun 'sinc --help' for usage" : "";
  return {
    ok: false,
    exitCode: EXIT_CODES.MISUSE,
    message: `${formatError(message)}${suffix}`,
  };
}

export function resolveCliAction(argv: string[]): CliActionResult {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      options: {
        help: { type: "boolean", short: "h" },
        version: { type: "boolean", short: "V" },
        resume: { type: "boolean", short: "r" },
        quiet: { type: "boolean", short: "q" },
        verbose: { type: "boolean", short: "v" },
        json: { type: "boolean" },
        completions: { type: "string" },
        list: { type: "boolean", short: "l" },
        kill: { type: "string", short: "k" },
        setup: { type: "boolean" },
        uninstall: { type: "boolean" },
      },
      strict: true,
      allowPositionals: true,
    });
  } catch (err) {
    return misuse((err as Error).message);
  }

  const values: CliValues = {
    help: Boolean(parsed.values.help),
    version: Boolean(parsed.values.version),
    resume: Boolean(parsed.values.resume),
    quiet: Boolean(parsed.values.quiet),
    verbose: Boolean(parsed.values.verbose),
    json: Boolean(parsed.values.json),
    completions:
      typeof parsed.values.completions === "string"
        ? parsed.values.completions
        : undefined,
    list: Boolean(parsed.values.list),
    kill: typeof parsed.values.kill === "string" ? parsed.values.kill : undefined,
    setup: Boolean(parsed.values.setup),
    uninstall: Boolean(parsed.values.uninstall),
  };
  const { positionals } = parsed;

  if (values.help) {
    return { ok: true, action: "help", values };
  }

  if (values.version) {
    return { ok: true, action: "version", values };
  }

  if (values.completions) {
    return { ok: true, action: "completions", values };
  }

  const [command, ...rest] = positionals;
  if (command) {
    if (command === "list") {
      if (rest.length !== 0) {
        return misuse("'sinc list' takes no arguments");
      }
      values.list = true;
    } else if (command === "kill") {
      if (rest.length !== 1) {
        return misuse("Usage: sinc kill <id>", false);
      }
      if (values.kill && values.kill !== rest[0]) {
        return misuse("Multiple kill targets specified");
      }
      values.kill = rest[0];
    } else if (command === "push" || command === "pull") {
      return misuse(`'sinc ${command}' is not implemented yet`);
    } else {
      return misuse(`Unknown command: ${command}`);
    }
  }

  const actionCount =
    Number(Boolean(values.list)) +
    Number(Boolean(values.kill)) +
    Number(Boolean(values.setup)) +
    Number(Boolean(values.uninstall));

  if (actionCount > 1) {
    return misuse("Only one command may be used at a time");
  }

  if (values.list) {
    return { ok: true, action: "list", values };
  }

  if (values.kill) {
    return { ok: true, action: "kill", values };
  }

  if (values.setup) {
    return { ok: true, action: "setup", values };
  }

  if (values.uninstall) {
    return { ok: true, action: "uninstall", values };
  }

  return { ok: true, action: "connect", values };
}

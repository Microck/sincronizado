#!/usr/bin/env bun
import { connect } from "./commands/connect";
import { list } from "./commands/list";
import { kill } from "./commands/kill";
import { push } from "./commands/push";
import { pull } from "./commands/pull";
import { setup } from "./commands/setup";
import { uninstall } from "./commands/uninstall";
import { getCompletionScript } from "./completions";
import { EXIT_CODES } from "../utils";
import { log, formatError } from "./output";
import { initOutput } from "./output-context";
import { notifyIfUpdateAvailable } from "../updates/check";
import { getCliVersion } from "../utils/version";
import { resolveCliAction } from "./dispatch";

const HELP_TEXT = `sinc - Connect to VPS AI agent with synced files

Usage: sinc [options] [command]

Commands:
  list          List active sessions
  kill <id>     Kill a session
  push          Push local state to remote
  pull          Pull remote state to local

Options:
  -h, --help      Show this help message
  -V, --version   Show version number
  -r, --resume    Resume existing session
  -q, --quiet     Suppress non-essential output
  -v, --verbose   Show diagnostic output
      --json      Emit machine-readable output
      --yes       Skip confirmation prompts
      --completions <shell> Print shell completions (bash|zsh|fish)
  -l, --list      List active sessions
  -k, --kill <id> Kill a session
      --setup     Run interactive setup
      --uninstall Remove sincronizado configuration

Run without options to connect to VPS in current project directory.
`;

async function main(): Promise<number> {
  const resolved = resolveCliAction(Bun.argv.slice(2));
  if (!resolved.ok) {
    log(resolved.message);
    return resolved.exitCode;
  }

  const { action, values } = resolved;
  initOutput({ quiet: values.quiet, verbose: values.verbose, json: values.json });

  if (action === "help") {
    console.log(HELP_TEXT);
    return EXIT_CODES.SUCCESS;
  }

  if (action === "version") {
    const version = await getCliVersion();
    console.log(`sinc version ${version}`);
    return EXIT_CODES.SUCCESS;
  }

  if (action === "completions") {
    try {
      console.log(getCompletionScript(values.completions ?? ""));
      return EXIT_CODES.SUCCESS;
    } catch (err) {
      log(formatError((err as Error).message));
      return EXIT_CODES.MISUSE;
    }
  }

  if (process.env.SINC_NO_UPDATE_CHECK !== "1") {
    await notifyIfUpdateAvailable();
  }

  if (action === "list") {
    return await list();
  }

  if (action === "kill") {
    return await kill(values.kill ?? "");
  }

  if (action === "push") {
    return await push({ yes: values.yes });
  }

  if (action === "pull") {
    return await pull({ yes: values.yes });
  }

  if (action === "setup") {
    return await setup();
  }

  if (action === "uninstall") {
    return await uninstall();
  }

  return await connect({ resume: values.resume });
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    log(formatError("Unexpected error", err.message));
    process.exit(EXIT_CODES.GENERAL_ERROR);
  });

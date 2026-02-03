#!/usr/bin/env bun
import { parseArgs } from "util";
import { connect } from "./commands/connect";
import { list } from "./commands/list";
import { kill } from "./commands/kill";
import { setup } from "./commands/setup";
import { getCompletionScript } from "./completions";
import { EXIT_CODES } from "../utils";
import { log, formatError } from "./output";
import { initOutput } from "./output-context";

const HELP_TEXT = `sinc - Connect to VPS AI agent with synced files

Usage: sinc [options]

Options:
  -h, --help      Show this help message
  -V, --version   Show version number
  -r, --resume    Resume existing session
  -q, --quiet     Suppress non-essential output
  -v, --verbose   Show diagnostic output
      --json      Emit machine-readable output
      --completions <shell> Print shell completions (bash|zsh|fish)
      --list      List active sessions
      --kill <id> Kill a session
      --setup     Run interactive setup

Run without options to connect to VPS in current project directory.
`;

const VERSION = "2.0.0";

async function main(): Promise<number> {
  let args;
  try {
    args = parseArgs({
      args: Bun.argv.slice(2),
      options: {
        help: { type: "boolean", short: "h" },
        version: { type: "boolean", short: "V" },
        resume: { type: "boolean", short: "r" },
        quiet: { type: "boolean", short: "q" },
        verbose: { type: "boolean", short: "v" },
        json: { type: "boolean" },
        completions: { type: "string" },
        list: { type: "boolean" },
        kill: { type: "string" },
        setup: { type: "boolean" },
      },
      strict: true,
      allowPositionals: false,
    });
  } catch (err) {
    log(formatError((err as Error).message));
    log("Run 'sinc --help' for usage");
    return EXIT_CODES.MISUSE;
  }

  const { values } = args;
  initOutput({ quiet: values.quiet, verbose: values.verbose, json: values.json });

  if (values.help) {
    console.log(HELP_TEXT);
    return EXIT_CODES.SUCCESS;
  }

  if (values.version) {
    console.log(`sinc version ${VERSION}`);
    return EXIT_CODES.SUCCESS;
  }

  if (values.completions) {
    try {
      console.log(getCompletionScript(values.completions));
      return EXIT_CODES.SUCCESS;
    } catch (err) {
      log(formatError((err as Error).message));
      return EXIT_CODES.MISUSE;
    }
  }

  if (values.list) {
    return await list();
  }

  if (values.kill) {
    return await kill(values.kill);
  }

  if (values.setup) {
    return await setup();
  }

  return await connect({ resume: values.resume });
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    log(formatError("Unexpected error", err.message));
    process.exit(EXIT_CODES.GENERAL_ERROR);
  });

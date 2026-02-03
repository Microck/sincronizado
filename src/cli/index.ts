#!/usr/bin/env bun
import { parseArgs } from "util";
import { connect } from "./commands/connect";
import { list } from "./commands/list";
import { kill } from "./commands/kill";
import { EXIT_CODES } from "../utils";
import { log, formatError } from "./output";

const HELP_TEXT = `sinc - Connect to VPS AI agent with synced files

Usage: sinc [options]

Options:
  -h, --help      Show this help message
  -v, --version   Show version number
  -r, --resume    Resume existing session
      --list      List active sessions
      --kill <id> Kill a session

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
        version: { type: "boolean", short: "v" },
        resume: { type: "boolean", short: "r" },
        list: { type: "boolean" },
        kill: { type: "string" },
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

  if (values.help) {
    console.log(HELP_TEXT);
    return EXIT_CODES.SUCCESS;
  }

  if (values.version) {
    console.log(`sinc version ${VERSION}`);
    return EXIT_CODES.SUCCESS;
  }

  if (values.list) {
    return await list();
  }

  if (values.kill) {
    return await kill(values.kill);
  }

  return await connect({ resume: values.resume });
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    log(formatError("Unexpected error", err.message));
    process.exit(EXIT_CODES.GENERAL_ERROR);
  });

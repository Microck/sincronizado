import ora, { type Ora } from "ora";
import chalk from "chalk";
import { getOutputMode, isJson, isVerbose, shouldLog } from "./output-context";

export function createSpinner(text: string): Ora {
  const mode = getOutputMode();
  const isSilent = mode.quiet || mode.json;
  return ora({ text, color: "cyan", isSilent });
}

export function formatError(message: string, suggestion?: string): string {
  let output = chalk.red(`Error: ${message}`);
  if (suggestion) {
    output += `\n${chalk.dim(`Suggestion: ${suggestion}`)}`;
  }
  return output;
}

export function formatSuccess(message: string): string {
  return chalk.green(message);
}

export function log(message: string): void {
  if (!shouldLog()) {
    return;
  }
  console.error(message);
}

export function logVerbose(message: string): void {
  if (!isVerbose() || !shouldLog()) {
    return;
  }
  console.error(message);
}

export function emitJson(payload: unknown): void {
  if (!isJson()) {
    return;
  }
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

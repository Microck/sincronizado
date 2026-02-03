import ora, { type Ora } from "ora";
import chalk from "chalk";

export function createSpinner(text: string): Ora {
  return ora({ text, color: "cyan" });
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
  console.error(message);
}

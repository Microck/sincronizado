export interface OutputMode {
  quiet: boolean;
  verbose: boolean;
  json: boolean;
}

const outputMode: OutputMode = {
  quiet: false,
  verbose: false,
  json: false,
};

export function initOutput(mode: Partial<OutputMode>): OutputMode {
  outputMode.quiet = Boolean(mode.quiet);
  outputMode.verbose = Boolean(mode.verbose);
  outputMode.json = Boolean(mode.json);
  return { ...outputMode };
}

export function getOutputMode(): OutputMode {
  return { ...outputMode };
}

export function shouldLog(): boolean {
  return !outputMode.quiet;
}

export function isJson(): boolean {
  return outputMode.json;
}

export function isVerbose(): boolean {
  return outputMode.verbose;
}

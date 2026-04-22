/**
 * Standardized exit codes for the sincronizado CLI.
 * SUCCESS (0): Normal successful exit.
 * GENERAL_ERROR (1): Unexpected runtime error.
 * MISUSE (2): Invalid command-line usage.
 * CONFIG_ERROR (78): Configuration file error.
 * UNAVAILABLE (69): Required resource unavailable.
 * CONNECT_ERROR (76): VPS connection failure.
 */
export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  MISUSE: 2,
  CONFIG_ERROR: 78,
  UNAVAILABLE: 69,
  CONNECT_ERROR: 76,
} as const;

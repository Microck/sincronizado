/**
 * Shell escaping utilities for safe command interpolation.
 *
 * Uses single-quote wrapping which is safe against all shell expansions
 * (variables, command substitution, globs, etc.) because no characters
 * are special inside single quotes — except the closing single quote itself.
 */

/**
 * Escape a string for safe interpolation into a POSIX shell command.
 *
 * Wraps the value in single quotes, escaping any embedded single quotes
 * by ending the quoted span, adding an escaped quote, and re-opening.
 *
 * @example
 * shellQuote("hello world")   // => "'hello world'"
 * shellQuote("it's here")     // => "'it'\\''s here'"
 * shellQuote("/tmp/my dir/")  // => "'/tmp/my dir/'"
 */
export function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

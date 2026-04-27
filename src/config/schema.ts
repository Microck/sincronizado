import { z } from "zod";

// Validates that a string contains only safe characters for use in SSH arguments.
// Prevents command injection via malicious hostname/user values in config.
const safeIdentifier = (fieldName: string) =>
  z
    .string()
    .min(1, `${fieldName} cannot be empty`)
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/,
      `${fieldName} contains invalid characters. Only letters, numbers, dots, hyphens, and underscores are allowed.`
    );

export const configSchema = z.object({
  vps: z.object({
    hostname: safeIdentifier("Hostname"),
    user: safeIdentifier("Username").default("ubuntu"),
    port: z.number().int().positive().default(22),
  }),
  sync: z
    .object({
      mode: z.enum(["none", "pull", "push", "both"]).default("both"),
      ignore: z
        .array(z.string())
        .default(["node_modules", ".venv", ".git", "__pycache__", ".DS_Store"]),
      remoteBase: z.string().default("~/workspace"),
    })
    .default({}),
  agent: z.enum(["opencode", "claude"]).default("opencode"),
  ssh: z
    .object({
      connectTimeout: z.number().int().positive().default(10),
      keepaliveInterval: z.number().int().positive().default(60),
      identityFile: z.string().min(1).optional(),
    })
    .default({}),
  connection: z
    .object({
      protocols: z
        .array(z.enum(["ssh", "et", "mosh"]))
        .default(["ssh", "et", "mosh"]),
      reconnect: z
        .object({
          maxAttempts: z.number().int().positive().default(5),
          baseDelayMs: z.number().int().positive().default(1000),
          maxDelayMs: z.number().int().positive().default(10000),
        })
        .default({}),
    })
    .default({}),
});

export type Config = z.infer<typeof configSchema>;

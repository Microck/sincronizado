import { z } from "zod";

export const configSchema = z.object({
  vps: z.object({
    hostname: z.string().min(1),
    user: z.string().default("ubuntu"),
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
    })
    .default({}),
});

export type Config = z.infer<typeof configSchema>;

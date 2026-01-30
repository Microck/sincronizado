# HANDOFF

Goal

- Move docs to Mintlify, serve at `https://sincronizado.micr.dev`.
- Keep installer endpoints working on same domain: `/install.sh`, `/install.ps1`, `/launcher/*`.

State

- Branch: `mic/mintlify`
- Staged: `mintlify/*` (Mintlify site)
- Untracked: `vercel.json` (Vercel proxy)
- Old Docusaurus site still exists under `docs/` (unused once Mintlify live).

What changed

- Mintlify docs added under `mintlify/` with Google Sans + yellow palette.
- Mermaid fix: do not HTML-escape `<` inside mermaid code blocks. (`mintlify/architecture.mdx`)
- Redirects added for old Docusaurus paths in `mintlify/docs.json`:
  - `/docs/*` -> `/*`
  - `/index` -> `/`
- Added root `vercel.json` for Vercel rewrites to Mintlify + installer endpoints.

Local verification

- `cd mintlify`
- `npx -y mintlify@latest validate`
- `npx -y mintlify@latest broken-links`
- `npx -y mintlify@latest dev --no-open`

Known issues

- Windows: Mintlify CLI may fail with `EPERM rename C:\Users\Microck\.mintlify -> ...` if cache dir locked.
  - Fix: kill stray `node` processes running Mintlify CLI; retry. If still stuck, delete `C:\Users\Microck\.mintlify` manually.

Deployment plan (domain = sincronizado.micr.dev)

1. Mintlify dashboard

- Create project + connect GitHub repo.
- Enable monorepo and set docs path to `/mintlify` (no trailing slash).

2. Vercel proxy (domain stays on Vercel)

- Mintlify redirects are internal-only; file serving does not support `.sh`/`.ps1`.
- Use Vercel `rewrites` to proxy everything to Mintlify, except installer endpoints.
- Config file: `vercel.json`
  - Replace `REPLACE_ME.mintlify.app` with your Mintlify origin hostname.
  - Keeps:
    - `/install.sh` -> raw GitHub `scripts/setup-vps.sh`
    - `/install.ps1` -> raw GitHub `scripts/install.ps1`
    - `/launcher/*` -> raw GitHub `launcher/*`
  - Proxies:
    - `/_mintlify/*`, `/api/request`, `/mintlify-assets/*`, `/llms*.txt`, `/sitemap.xml`, `/robots.txt`, `/mcp`, and `/*`.

Next steps

- Fill in Mintlify origin hostname in `vercel.json`.
- `git add vercel.json`.
- Commit staged changes.
- Optional cleanup: remove/retire `docs/` Docusaurus once Mintlify is live.

Unresolved questions

- What is the Mintlify origin hostname for this project?

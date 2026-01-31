import React from 'react';
import { ButtonGroup } from '../components/Button.js';
import type { InstallConfig } from '../App.js';
import { mkdirSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { useRenderer } from '@opentui/react';

interface CompleteProps {
  config: InstallConfig;
  onExit: () => void;
}

export function Complete({ config, onExit }: CompleteProps) {
  const renderer = useRenderer();
  const ip = config.hostname || '<hostname>';

  let stepNum = 1;

  const writeLocalConfig = () => {
    const configDir = join(homedir(), '.sincronizado');
    const configFile = join(configDir, 'config.json');
    mkdirSync(configDir, { recursive: true });

    const configToSave = {
      vps: {
        host: config.hostname,
        user: config.sshUser,
      },
      config,
    };

    writeFileSync(configFile, JSON.stringify(configToSave, null, 2));
  };

  const requestVpsSetup = () => {
    const resultFile = join(process.cwd(), '.tui-result.json');
    const result = {
      action: 'setup-vps',
      host: config.hostname,
      user: config.sshUser,
      mode: config.mode,
      flags: buildFlags(config),
    };

    writeFileSync(resultFile, JSON.stringify(result, null, 2));
    renderer.destroy();
  };

  return (
    <box flexDirection="column" paddingTop={2}>
      <box paddingBottom={1}>
        <text fg="green">
          <b>Installation complete</b>
        </text>
      </box>

      <box paddingTop={1} paddingBottom={1}>
        <text>
          <b>Next steps:</b>
        </text>
      </box>

      <box paddingLeft={2} flexDirection="column">
        <text>{stepNum++}. Run: ./launcher/opencode.ps1 (Windows)</text>
        <text> Or: ./launcher/opencode.sh (macOS/Linux)</text>
      </box>

      {config.setupAlias && (
        <box paddingLeft={2} paddingTop={1} flexDirection="column">
          <text>{stepNum++}. Setup shell alias:</text>
          <text> Windows (PowerShell):</text>
          <text>
            {
              ' echo "function opencode { & \'~/sincronizado/launcher/opencode.ps1\' $args }" | Add-Content $PROFILE'
            }
          </text>
          <text> macOS/Linux:</text>
          <text>
            {' echo \'alias opencode="~/sincronizado/launcher/opencode.sh"\' >> ~/.bashrc'}
          </text>
          <text> source ~/.bashrc</text>
        </box>
      )}

      {!config.noAgentOS && (
        <box paddingLeft={2} paddingTop={1}>
          <text>
            {stepNum++}. Access mobile UI: http://{ip}:3000
          </text>
        </box>
      )}

      {config.withOpenSync && (
        <box paddingLeft={2} paddingTop={1} flexDirection="column">
          <text>{stepNum++}. Install OpenSync plugin:</text>
          <text> npm install -g opencode-sync-plugin</text>
          <text> opencode-sync login</text>
          <text fg="gray"> Then add to opencode.json plugins array</text>
        </box>
      )}

      {config.withLunaroute && (
        <box paddingLeft={2} paddingTop={1}>
          <text>
            {stepNum++}. AI proxy dashboard: http://{ip}:8082
          </text>
        </box>
      )}

      {config.withKimaki && (
        <box paddingLeft={2} paddingTop={1}>
          <text>{stepNum++}. Configure Discord bot:</text>
          <text>
            {' '}
            ssh {config.sshUser}@{ip}
          </text>
          <text> npx kimaki</text>
        </box>
      )}

      <box paddingTop={3}>
        <ButtonGroup
          buttons={[
            {
              label: 'Setup VPS',
              onClick: () => {
                writeLocalConfig();
                requestVpsSetup();
              },
              variant: 'primary',
            },
            { label: 'Exit', onClick: onExit, variant: 'secondary' },
          ]}
        />
      </box>
    </box>
  );
}

function buildFlags(config: InstallConfig): string {
  const flags: string[] = [`--mode=${config.mode}`];

  if (config.withKimaki) flags.push('--with-kimaki');
  if (config.withLunaroute) flags.push('--with-lunaroute');
  if (config.withWorktreeSession) flags.push('--with-worktree-session');
  if (config.withSessionHandoff) flags.push('--with-session-handoff');
  if (config.withAgentOfEmpires) flags.push('--with-agent-of-empires');
  if (config.noAgentOS) flags.push('--no-agent-os');
  if (config.noCcmanager) flags.push('--no-ccmanager');
  if (config.noPlugins) flags.push('--no-plugins');

  return flags.join(' ');
}

import React from 'react';
import { ButtonGroup } from '../components/Button.js';
import type { InstallConfig } from '../App.js';

interface CompleteProps {
  config: InstallConfig;
  onExit: () => void;
}

export function Complete({ config, onExit }: CompleteProps) {
  const ip = config.hostname || '<hostname>';

  let stepNum = 1;

  return (
    <box flexDirection="column" paddingTop={2}>
      <box paddingBottom={1}>
        <text color="green" bold>
          ✓ Installation complete!
        </text>
      </box>

      <box paddingTop={1} paddingBottom={1}>
        <text bold>Next steps:</text>
      </box>

      <box paddingLeft={2}>
        <text>{stepNum++}. Run: ./launcher/opencode.ps1 (Windows)</text>
        <text> Or: ./launcher/opencode.sh (macOS/Linux)</text>
      </box>

      {config.setupAlias && (
        <box paddingLeft={2} paddingTop={1}>
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
        <box paddingLeft={2} paddingTop={1}>
          <text>{stepNum++}. Install OpenSync plugin:</text>
          <text> npm install -g opencode-sync-plugin</text>
          <text> opencode-sync login</text>
          <text dimColor> Then add to opencode.json plugins array</text>
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
        <ButtonGroup buttons={[{ label: 'Exit', onClick: onExit, variant: 'primary' }]} />
      </box>

      <box paddingTop={2}>
        <text color="#FFFFC5" dimColor>
          {
            '                                  ██                                                                                 ██                                  '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            '                                 ████                                                                ███  ███       █████                                 '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            '                               █████                                                                 ████ ████       █████                                '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            '                              ████                                                                    ███  ███         ████                               '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            '                             ████                        ██                      ███                   ███  ███         ████                              '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            '             ████████       ████                         ████                  ████                     ██   ██          ████       ████████             '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            '          ████████████      ████                           ████               ████                                        ███      █████████████         '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            '      █████████    ████     ███           ██████████████████████            ███████████████████████                       ███     ████    █████████      '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            '  █████████ ████   ████     ███           ██████████████████████            ███████████████████████                       ███      ███   ████ █████████  '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            ' ████████    █████████      ████                                                                                          ███      ██████████   ████████ '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            '    █████████ ██████        ████                                                                                         ████        ██████ █████████    '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            '        ████████             ████                                     █                                                 ████             █████████       '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            '           █████████          ████                                   ███                                               ████          █████████           '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            '               ████████        ████                                ██████                                             ████        ████████               '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            '                   ████         █████                             ███  ███                                          █████         ████                   '
          }
        </text>
        <text color="#FFFFC5" dimColor>
          {
            '                                   ██                              ██     █                                           ███                                 '
          }
        </text>
      </box>

      {config.withOpenSync && (
        <box paddingTop={1}>
          <text color="#FFFFC5" dimColor>
            📊 OpenSync: Track sessions anywhere
          </text>
        </box>
      )}
    </box>
  );
}

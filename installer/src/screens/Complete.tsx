import React from 'react';
import { Box, Text } from '@opentui/react';
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
    <Box flexDirection="column" paddingTop={2}>
      <Box paddingBottom={1}>
        <Text color="green" bold>
          ✓ Installation complete!
        </Text>
      </Box>

      <Box paddingTop={1} paddingBottom={1}>
        <Text bold>Next steps:</Text>
      </Box>

      <Box paddingLeft={2}>
        <Text>{stepNum++}. Run: ./launcher/opencode.ps1 (Windows)</Text>
        <Text> Or: ./launcher/opencode.sh (macOS/Linux)</Text>
      </Box>

      {config.setupAlias && (
        <Box paddingLeft={2} paddingTop={1}>
          <Text>{stepNum++}. Setup shell alias:</Text>
          <Text> Windows (PowerShell):</Text>
          <Text> echo "function opencode {{ & \"~/sincronizado/launcher/opencode.ps1\" @args }}" | Add-Content $PROFILE</Text>
          <Text> macOS/Linux:</Text>
          <Text> echo 'alias opencode="~/sincronizado/launcher/opencode.sh"' >> ~/.bashrc</Text>
          <Text> source ~/.bashrc</Text>
        </Box>
      )}

      {!config.noAgentOS && (
        <Box paddingLeft={2} paddingTop={1}>
          <Text>{stepNum++}. Access mobile UI: http://{ip}:3000</Text>
        </Box>
      )}

      {config.withOpenSync && (
        <Box paddingLeft={2} paddingTop={1}>
          <Text>{stepNum++}. Install OpenSync plugin:</Text>
          <Text> npm install -g opencode-sync-plugin</Text>
          <Text> opencode-sync login</Text>
          <Text dimColor> Then add to opencode.json plugins array</Text>
        </Box>
      )}

      {config.withLunaroute && (
        <Box paddingLeft={2} paddingTop={1}>
          <Text>{stepNum++}. AI proxy dashboard: http://{ip}:8082</Text>
        </Box>
      )}

      {config.withKimaki && (
        <Box paddingLeft={2} paddingTop={1}>
          <Text>{stepNum++}. Configure Discord bot:</Text>
          <Text> ssh {config.sshUser}@{ip}</Text>
          <Text> npx kimaki</Text>
        </Box>
      )}

      <Box paddingTop={3}>
        <ButtonGroup buttons={[{ label: 'Exit', onClick: onExit, variant: 'primary' }]} />
      </Box>

      <Box paddingTop={2}>
        <Text color="#FFFFC5" dimColor>{'                                  ██                                                                                 ██                                  '}</Text>
        <Text color="#FFFFC5" dimColor>{'                                 ████                                                                ███  ███       █████                                 '}</Text>
        <Text color="#FFFFC5" dimColor>{'                               █████                                                                 ████ ████       █████                                '}</Text>
        <Text color="#FFFFC5" dimColor>{'                              ████                                                                    ███  ███         ████                               '}</Text>
        <Text color="#FFFFC5" dimColor>{'                             ████                        ██                      ███                   ███  ███         ████                              '}</Text>
        <Text color="#FFFFC5" dimColor>{'             ████████       ████                         ████                  ████                     ██   ██          ████       ████████             '}</Text>
        <Text color="#FFFFC5" dimColor>{'          ████████████      ████                           ████               ████                                        ███      █████████████         '}</Text>
        <Text color="#FFFFC5" dimColor>{'      █████████    ████     ███           ██████████████████████            ███████████████████████                       ███     ████    █████████      '}</Text>
        <Text color="#FFFFC5" dimColor>{'  █████████ ████   ████     ███           ██████████████████████            ███████████████████████                       ███      ███   ████ █████████  '}</Text>
        <Text color="#FFFFC5" dimColor>{' ████████    █████████      ████                                                                                          ███      ██████████   ████████ '}</Text>
        <Text color="#FFFFC5" dimColor>{'    █████████ ██████        ████                                                                                         ████        ██████ █████████    '}</Text>
        <Text color="#FFFFC5" dimColor>{'        ████████             ████                                     █                                                 ████             █████████       '}</Text>
        <Text color="#FFFFC5" dimColor>{'           █████████          ████                                   ███                                               ████          █████████           '}</Text>
        <Text color="#FFFFC5" dimColor>{'               ████████        ████                                ██████                                             ████        ████████               '}</Text>
        <Text color="#FFFFC5" dimColor>{'                   ████         █████                             ███  ███                                          █████         ████                   '}</Text>
        <Text color="#FFFFC5" dimColor>{'                                   ██                              ██     █                                           ███                                 '}</Text>
      </Box>

      {config.withOpenSync && (
        <Box paddingTop={1}>
          <Text color="#FFFFC5" dimColor>
            📊 OpenSync: Track sessions anywhere
          </Text>
        </Box>
      )}
    </Box>
  );
}

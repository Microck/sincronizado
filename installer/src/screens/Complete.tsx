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
        <Text>1. Run: ./launcher/opencode.ps1 (Windows)</Text>
        <Text> Or: ./launcher/opencode.sh (macOS/Linux)</Text>
      </Box>

      {!config.noAgentOS && (
        <Box paddingLeft={2} paddingTop={1}>
          <Text>2. Access mobile UI: http://{ip}:3000</Text>
        </Box>
      )}

      {config.withLunaroute && (
        <Box paddingLeft={2}>
          <Text>3. AI proxy dashboard: http://{ip}:8082</Text>
        </Box>
      )}

      {config.withKimaki && (
        <Box paddingLeft={2} paddingTop={1}>
          <Text>4. Configure Discord bot:</Text>
          <Text>
            {' '}
            ssh {config.sshUser}@{ip}
          </Text>
          <Text> npx kimaki</Text>
        </Box>
      )}

      <Box paddingTop={3}>
        <ButtonGroup buttons={[{ label: 'Exit', onClick: onExit, variant: 'primary' }]} />
      </Box>

      <Box paddingTop={2}>
        <Text color="cyan" dimColor>
          {'    ᕙ(⇀‸↼‶)ᕗ    '}
        </Text>
      </Box>
    </Box>
  );
}

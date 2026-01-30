import React from 'react';
import { Box, Text } from '@opentui/react';
import { ButtonGroup } from '../components/Button.js';
import type { InstallConfig } from '../App.js';

interface ConfigProps {
  config: InstallConfig;
  onChange: (updates: Partial<InstallConfig>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Config({ config, onChange, onContinue, onBack }: ConfigProps) {
  return (
    <Box flexDirection="column" paddingTop={2}>
      <Box paddingBottom={1}>
        <Text bold>VPS Connection Details</Text>
      </Box>
      <Box paddingBottom={1}>
        <Text>Hostname/IP: </Text>
        <Text color="#FFFFC5">{config.hostname || '<not set>'}</Text>
      </Box>
      <Box paddingBottom={1}>
        <Text>SSH User: </Text>
        <Text color="#FFFFC5">{config.sshUser}</Text>
      </Box>
      <Box paddingBottom={1}>
        <Text>Project Root: </Text>
        <Text color="#FFFFC5">{config.projectRoot}</Text>
      </Box>
      <Box paddingTop={2}>
        <Text dimColor>
          Configure these in your .opencode.config.json or via environment variables:
        </Text>
      </Box>
      <Box paddingTop={1} paddingLeft={2}>
        <Text dimColor>SINC_HOSTNAME, SINC_SSH_USER, SINC_PROJECT_ROOT</Text>
      </Box>
      <Box paddingTop={3}>
        <ButtonGroup
          buttons={[
            { label: 'Continue', onClick: onContinue, variant: 'primary' },
            { label: 'Back', onClick: onBack, variant: 'secondary' },
          ]}
        />
      </Box>
    </Box>
  );
}

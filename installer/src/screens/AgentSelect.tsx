import React from 'react';
import { Box, Text } from '@opentui/react';
import { RadioGroup } from '../components/RadioGroup.js';
import { ButtonGroup } from '../components/Button.js';
import type { InstallConfig, AIAgent } from '../App.js';

interface AgentSelectProps {
  config: InstallConfig;
  onChange: (updates: Partial<InstallConfig>) => void;
  onContinue: () => void;
  onBack: () => void;
}

const agents: { value: AIAgent; label: string; description: string }[] = [
  {
    value: 'opencode',
    label: 'OpenCode',
    description: 'Open-source AI coding assistant with plugin ecosystem',
  },
  {
    value: 'claude',
    label: 'Claude Code',
    description: "Anthropic's Claude with MCP server support",
  },
];

export function AgentSelect({ config, onChange, onContinue, onBack }: AgentSelectProps) {
  return (
    <Box flexDirection="column" paddingTop={2}>
      <Box paddingBottom={1}>
        <Text>Select your AI agent:</Text>
      </Box>
      <Box paddingBottom={2}>
        <RadioGroup
          options={agents}
          value={config.agent}
          onChange={(agent) => onChange({ agent })}
        />
      </Box>
      <Box paddingTop={2}>
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

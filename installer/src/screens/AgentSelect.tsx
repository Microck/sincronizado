import React from 'react';
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
    <box flexDirection="column" paddingTop={2}>
      <box paddingBottom={1}>
        <text>Select your AI agent:</text>
      </box>
      <box paddingBottom={2}>
        <RadioGroup
          options={agents}
          value={config.agent}
          onChange={(agent) => onChange({ agent })}
        />
      </box>
      <box paddingTop={2}>
        <ButtonGroup
          buttons={[
            { label: 'Continue', onClick: onContinue, variant: 'primary' },
            { label: 'Back', onClick: onBack, variant: 'secondary' },
          ]}
        />
      </box>
    </box>
  );
}

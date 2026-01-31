import React from 'react';
import { RadioGroup } from '../components/RadioGroup.js';
import { ButtonGroup } from '../components/Button.js';
import type { InstallConfig, InstallMode } from '../App.js';

interface ModeSelectProps {
  config: InstallConfig;
  onChange: (updates: Partial<InstallConfig>) => void;
  onContinue: () => void;
  onBack: () => void;
}

const modes: { value: InstallMode; label: string; description: string }[] = [
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Core only: OpenCode, Eternal Terminal, UFW',
  },
  {
    value: 'standard',
    label: 'Standard',
    description: 'Recommended: + Agent-OS, ccmanager, plugins',
  },
  {
    value: 'full',
    label: 'Full',
    description: 'Everything: + kimaki, session-handoff, worktree-session',
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Pick individual components',
  },
];

export function ModeSelect({ config, onChange, onContinue, onBack }: ModeSelectProps) {
  return (
    <box flexDirection="column" paddingTop={2}>
      <box paddingBottom={1}>
        <text>Select your installation mode:</text>
      </box>
      <box paddingBottom={2}>
        <RadioGroup options={modes} value={config.mode} onChange={(mode) => onChange({ mode })} />
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

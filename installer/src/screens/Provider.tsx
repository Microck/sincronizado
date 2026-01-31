import React from 'react';
import { RadioGroup } from '../components/RadioGroup.js';
import { ButtonGroup } from '../components/Button.js';
import type { InstallConfig, VPSProvider } from '../App.js';

interface ProviderProps {
  config: InstallConfig;
  onChange: (updates: Partial<InstallConfig>) => void;
  onContinue: () => void;
  onBack: () => void;
}

const providers: { value: VPSProvider; label: string; description: string }[] = [
  {
    value: 'oracle',
    label: 'Oracle Cloud',
    description: 'Free tier ARM64 instances (recommended)',
  },
  {
    value: 'hetzner',
    label: 'Hetzner',
    description: 'Affordable x86_64 cloud servers',
  },
  {
    value: 'digitalocean',
    label: 'DigitalOcean',
    description: 'Simple cloud droplets',
  },
  {
    value: 'aws',
    label: 'AWS',
    description: 'EC2 instances (any region)',
  },
  {
    value: 'other',
    label: 'Other / Manual',
    description: 'Any VPS provider',
  },
];

export function Provider({ config, onChange, onContinue, onBack }: ProviderProps) {
  return (
    <box flexDirection="column" paddingTop={2}>
      <box paddingBottom={1}>
        <text>Select your VPS provider:</text>
      </box>
      <box paddingBottom={2}>
        <RadioGroup
          options={providers}
          value={config.provider}
          onChange={(provider) => onChange({ provider })}
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

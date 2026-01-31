import React from 'react';
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
    <box flexDirection="column" paddingTop={2}>
      <box paddingBottom={1}>
        <text bold>VPS Connection Details</text>
      </box>
      <box paddingBottom={1}>
        <text>Hostname/IP: </text>
        <text color="#FFFFC5">{config.hostname || '<not set>'}</text>
      </box>
      <box paddingBottom={1}>
        <text>SSH User: </text>
        <text color="#FFFFC5">{config.sshUser}</text>
      </box>
      <box paddingBottom={1}>
        <text>Project Root: </text>
        <text color="#FFFFC5">{config.projectRoot}</text>
      </box>
      <box paddingTop={2}>
        <text dimColor>
          Configure these in your .opencode.config.json or via environment variables:
        </text>
      </box>
      <box paddingTop={1} paddingLeft={2}>
        <text dimColor>SINC_HOSTNAME, SINC_SSH_USER, SINC_PROJECT_ROOT</text>
      </box>
      <box paddingTop={3}>
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

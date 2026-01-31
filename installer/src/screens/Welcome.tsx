import React from 'react';
import { ButtonGroup } from '../components/Button.js';

interface WelcomeProps {
  onContinue: () => void;
  onExit: () => void;
}

export function Welcome({ onContinue, onExit }: WelcomeProps) {
  return (
    <box flexDirection="column" paddingTop={1}>
      <box paddingBottom={1}>
        <text>This installer will set up your VPS with sincronizado development environment.</text>
      </box>
      <box paddingBottom={1}>
        <text fg="gray">You will be guided through selecting:</text>
      </box>
      <box paddingLeft={2}>
        <text fg="gray">
          {[
            '• Installation mode (Minimal/Standard/Full)',
            '• AI agent (OpenCode or Claude Code)',
            '• Optional add-ons (Discord bot, AI proxy, OpenSync, etc.)',
            "• Shell alias setup (type 'opencode' from anywhere)",
            '• VPS provider and connection details',
          ].join('\n')}
        </text>
      </box>
      <box paddingTop={2}>
        <ButtonGroup
          buttons={[
            { label: 'Continue', onClick: onContinue, variant: 'primary' },
            { label: 'Exit', onClick: onExit, variant: 'secondary' },
          ]}
        />
      </box>
    </box>
  );
}

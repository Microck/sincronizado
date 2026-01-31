import React from 'react';
import { ButtonGroup } from '../components/Button.js';
import type { InstallConfig } from '../App.js';

interface ConfirmProps {
  config: InstallConfig;
  onInstall: () => void;
  onBack: () => void;
}

export function Confirm({ config, onInstall, onBack }: ConfirmProps) {
  const renderAddons = () => {
    const addons: string[] = [];
    if (config.withKimaki) addons.push('Kimaki');
    if (config.withLunaroute) addons.push('LunaRoute');
    if (config.withWorktreeSession) addons.push('Worktree Sessions');
    if (config.withSessionHandoff) addons.push('Session Handoff');
    if (config.withAgentOfEmpires) addons.push('Agent of Empires');

    if (addons.length === 0) return 'None';
    return addons.join(', ');
  };

  const renderSkips = () => {
    const skips: string[] = [];
    if (config.noAgentOS) skips.push('Agent-OS');
    if (config.noCcmanager) skips.push('ccmanager');
    if (config.noPlugins) skips.push('OpenCode plugins');

    if (skips.length === 0) return 'None';
    return skips.join(', ');
  };

  return (
    <box flexDirection="column" paddingTop={2}>
      <box paddingBottom={1}>
        <text bold>Review your installation:</text>
      </box>
      <box paddingLeft={2}>
        <text>
          <text bold>Mode:</text> {config.mode}
        </text>
        <text>
          <text bold>Provider:</text> {config.provider}
        </text>
        <text>
          <text bold>Hostname:</text> {config.hostname || '<not set>'}
        </text>
        <text>
          <text bold>SSH User:</text> {config.sshUser}
        </text>
        <text>
          <text bold>Add-ons:</text> {renderAddons()}
        </text>
        <text>
          <text bold>Skip:</text> {renderSkips()}
        </text>
      </box>
      <box paddingTop={2}>
        <text dimColor>This will SSH into your VPS and run the installation script.</text>
      </box>
      <box paddingTop={3}>
        <ButtonGroup
          buttons={[
            { label: 'Install', onClick: onInstall, variant: 'primary' },
            { label: 'Back', onClick: onBack, variant: 'secondary' },
          ]}
        />
      </box>
    </box>
  );
}

import React from 'react';
import type { Screen } from '../App.js';

const screenTitles: Record<Screen, string> = {
  welcome: 'Welcome',
  agent: 'Select AI Agent',
  mode: 'Installation Mode',
  addons: 'Select Add-ons',
  provider: 'VPS Provider',
  config: 'Configuration',
  confirm: 'Confirm Installation',
  install: 'Installing...',
  complete: 'Complete',
};

export function Header({ screen }: { screen: Screen }) {
  return (
    <box flexDirection="column" paddingBottom={1}>
      <box>
        <text fg="#FFFFC5">
          <b>╔══════════════════════════════════════════════════════════╗</b>
        </text>
      </box>
      <box>
        <text fg="#FFFFC5">
          <b>║</b>
        </text>
        <text fg="white">
          <b> SINCRONIZADO INSTALLER v1.1.0 </b>
        </text>
        <text fg="#FFFFC5">
          <b>║</b>
        </text>
      </box>
      <box>
        <text fg="#FFFFC5">
          <b>╚══════════════════════════════════════════════════════════╝</b>
        </text>
      </box>
      <box paddingTop={1}>
        <text fg="gray">
          {'  '}
          {screenTitles[screen]}
        </text>
      </box>
    </box>
  );
}

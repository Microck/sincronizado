import React from 'react';
import type { Screen } from '../App.js';

const screenTitles: Record<Screen, string> = {
  welcome: 'Welcome',
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
        <text bold color="#FFFFC5">
          ╔══════════════════════════════════════════════════════════╗
        </text>
      </box>
      <box>
        <text bold color="#FFFFC5">
          ║
        </text>
        <text bold color="white">
          {'           SINCRONIZADO INSTALLER v1.1.0            '}
        </text>
        <text bold color="#FFFFC5">
          ║
        </text>
      </box>
      <box>
        <text bold color="#FFFFC5">
          ╚══════════════════════════════════════════════════════════╝
        </text>
      </box>
      <box paddingTop={1}>
        <text dimColor>
          {'  '}
          {screenTitles[screen]}
        </text>
      </box>
    </box>
  );
}

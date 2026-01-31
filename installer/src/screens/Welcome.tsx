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
        <text color="#FFFFC5">
          {
            '                                  ██                                                                                 ██                                  '
          }
        </text>
        <text color="#FFFFC5">
          {
            '                                 ████                                                                ███  ███       █████                                 '
          }
        </text>
        <text color="#FFFFC5">
          {
            '                               █████                                                                 ████ ████       █████                                '
          }
        </text>
        <text color="#FFFFC5">
          {
            '                              ████                                                                    ███  ███         ████                               '
          }
        </text>
        <text color="#FFFFC5">
          {
            '                             ████                        ██                      ███                   ███  ███         ████                              '
          }
        </text>
        <text color="#FFFFC5">
          {
            '             ████████       ████                         ████                  ████                     ██   ██          ████       ████████             '
          }
        </text>
        <text color="#FFFFC5">
          {
            '          ████████████      ████                           ████               ████                                        ███      █████████████         '
          }
        </text>
        <text color="#FFFFC5">
          {
            '      █████████    ████     ███           ██████████████████████            ███████████████████████                       ███     ████    █████████      '
          }
        </text>
        <text color="#FFFFC5">
          {
            '  █████████ ████   ████     ███           ██████████████████████            ███████████████████████                       ███      ███   ████ █████████  '
          }
        </text>
        <text color="#FFFFC5">
          {
            ' ████████    █████████      ████                                                                                          ███      ██████████   ████████ '
          }
        </text>
        <text color="#FFFFC5">
          {
            '    █████████ ██████        ████                                                                                         ████        ██████ █████████    '
          }
        </text>
        <text color="#FFFFC5">
          {
            '        ████████             ████                                     █                                                 ████             █████████       '
          }
        </text>
        <text color="#FFFFC5">
          {
            '           █████████          ████                                   ███                                               ████          █████████           '
          }
        </text>
        <text color="#FFFFC5">
          {
            '               ████████        ████                                ██████                                             ████        ████████               '
          }
        </text>
        <text color="#FFFFC5">
          {
            '                   ████         █████                             ███  ███                                          █████         ████                   '
          }
        </text>
        <text color="#FFFFC5">
          {
            '                                   ██                              ██     █                                           ███                                 '
          }
        </text>
      </box>
      <box paddingBottom={1}>
        <text>
          This installer will set up your VPS with with sincronizado development environment.
        </text>
      </box>
      <box paddingBottom={1}>
        <text dimColor>You will be guided through selecting:</text>
      </box>
      <box paddingLeft={2}>
        <text dimColor>• Installation mode (Minimal/Standard/Full)</text>
        <text dimColor>• AI agent (OpenCode or Claude Code)</text>
        <text dimColor>• Optional add-ons (Discord bot, AI proxy, OpenSync, etc.)</text>
        <text dimColor>• Shell alias setup (type "opencode" anywhere)</text>
        <text dimColor>• VPS provider and connection details</text>
      </box>
      <box paddingTop={2} paddingBottom={1}>
        <text>Press tab/shift+tab to navigate, enter to select.</text>
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

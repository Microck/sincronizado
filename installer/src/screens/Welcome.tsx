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
        <text fg="#FFFFC5">
          {
            '                                  ██                                                                                 ██                                  '
          }
        </text>
        <text fg="#FFFFC5">
          {
            '                                 ████                                                                ███  ███       █████                                 '
          }
        </text>
        <text fg="#FFFFC5">
          {
            '                               █████                                                                 ████ ████       █████                                '
          }
        </text>
        <text fg="#FFFFC5">
          {
            '                              ████                                                                    ███  ███         ████                               '
          }
        </text>
        <text fg="#FFFFC5">
          {
            '                             ████                        ██                      ███                   ███  ███         ████                              '
          }
        </text>
        <text fg="#FFFFC5">
          {
            '             ████████       ████                         ████                  ████                     ██   ██          ████       ████████             '
          }
        </text>
        <text fg="#FFFFC5">
          {
            '          ████████████      ████                           ████               ████                                        ███      █████████████         '
          }
        </text>
        <text fg="#FFFFC5">
          {
            '      █████████    ████     ███           ██████████████████████            ███████████████████████                       ███     ████    █████████      '
          }
        </text>
        <text fg="#FFFFC5">
          {
            '  █████████ ████   ████     ███           ██████████████████████            ███████████████████████                       ███      ███   ████ █████████  '
          }
        </text>
        <text fg="#FFFFC5">
          {
            ' ████████    █████████      ████                                                                                          ███      ██████████   ████████ '
          }
        </text>
        <text fg="#FFFFC5">
          {
            '    █████████ ██████        ████                                                                                         ████        ██████ █████████    '
          }
        </text>
        <text fg="#FFFFC5">
          {
            '        ████████             ████                                     █                                                 ████             █████████       '
          }
        </text>
        <text fg="#FFFFC5">
          {
            '           █████████          ████                                   ███                                               ████          █████████           '
          }
        </text>
        <text fg="#FFFFC5">
          {
            '               ████████        ████                                ██████                                             ████        ████████               '
          }
        </text>
        <text fg="#FFFFC5">
          {
            '                   ████         █████                             ███  ███                                          █████         ████                   '
          }
        </text>
        <text fg="#FFFFC5">
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
        <text fg="gray">You will be guided through selecting:</text>
      </box>
      <box paddingLeft={2}>
        <text fg="gray">• Installation mode (Minimal/Standard/Full)</text>
        <text fg="gray">• AI agent (OpenCode or Claude Code)</text>
        <text fg="gray">• Optional add-ons (Discord bot, AI proxy, OpenSync, etc.)</text>
        <text fg="gray">• Shell alias setup (type 'opencode' from anywhere)</text>
        <text fg="gray">• VPS provider and connection details</text>
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

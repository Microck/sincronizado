import React from 'react';

interface ProgressBarProps {
  progress: number;
  label: string;
  status?: 'pending' | 'running' | 'complete' | 'error';
}

export function ProgressBar({ progress, label, status = 'pending' }: ProgressBarProps) {
  const width = 40;
  const filled = Math.round((progress / 100) * width);
  const empty = width - filled;

  const statusIcon = {
    pending: '○',
    running: '●',
    complete: '✓',
    error: '✗',
  }[status];

  const statusColor = {
    pending: 'gray',
    running: '#FFFFC5',
    complete: 'green',
    error: 'red',
  }[status];

  return (
    <box flexDirection="column">
      <box>
        <text fg={statusColor}>
          {statusIcon} {label}
        </text>
      </box>
      <box>
        <text fg="#FFFFC5">{'█'.repeat(filled)}</text>
        <text fg="gray">{'░'.repeat(empty)}</text>
        <text> {Math.round(progress)}%</text>
      </box>
    </box>
  );
}

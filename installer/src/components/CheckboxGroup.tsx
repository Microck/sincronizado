import React from 'react';
import { useKeyboard } from '@opentui/react';

interface CheckboxGroupProps {
  options: { value: string; label: string; description?: string }[];
  values: string[];
  onChange: (values: string[]) => void;
}

export function CheckboxGroup({ options, values, onChange }: CheckboxGroupProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  useKeyboard((key) => {
    if (key.name === 'upArrow') {
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else if (key.name === 'downArrow') {
      setSelectedIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (key.name === 'space') {
      const option = options[selectedIndex];
      if (values.includes(option.value)) {
        onChange(values.filter((v) => v !== option.value));
      } else {
        onChange([...values, option.value]);
      }
    }
  });

  return (
    <box flexDirection="column">
      {options.map((option, index) => (
        <box key={option.value}>
          <text>
            {index === selectedIndex ? '> ' : '  '}
            {values.includes(option.value) ? '[x] ' : '[ ] '}
            {option.label}
            {index === selectedIndex && option.description && (
              <text fg="gray"> — {option.description}</text>
            )}
          </text>
        </box>
      ))}
      <box paddingTop={1}>
        <text fg="gray">Press space to toggle, arrow keys to navigate</text>
      </box>
    </box>
  );
}

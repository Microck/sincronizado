import React from 'react';
import { useKeyboard } from '@opentui/react';

interface RadioGroupProps<T> {
  options: { value: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function RadioGroup<T extends string>({ options, value, onChange }: RadioGroupProps<T>) {
  const [selectedIndex, setSelectedIndex] = React.useState(() =>
    options.findIndex((o) => o.value === value),
  );

  useKeyboard((key) => {
    if (key.name === 'upArrow') {
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else if (key.name === 'downArrow') {
      setSelectedIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (key.name === 'return') {
      onChange(options[selectedIndex].value);
    }
  });

  return (
    <box flexDirection="column">
      {options.map((option, index) => (
        <box key={option.value}>
          <text>
            {index === selectedIndex ? '● ' : '○ '}
            {option.label}
            {index === selectedIndex && option.description && (
              <text fg="gray"> — {option.description}</text>
            )}
          </text>
        </box>
      ))}
    </box>
  );
}

import React from 'react';
import { useKeyboard } from '@opentui/react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  useKeyboard((key) => {
    if (isFocused && key.name === 'return') {
      onClick();
    }
  });

  const color = variant === 'danger' ? 'red' : variant === 'secondary' ? 'gray' : '#FFFFC5';

  return (
    <box borderStyle={isFocused ? 'double' : 'single'} paddingX={2}>
      <text color={isFocused ? color : undefined} bold={isFocused}>
        {label}
      </text>
    </box>
  );
}

interface ButtonGroupProps {
  buttons: { label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'danger' }[];
}

export function ButtonGroup({ buttons }: ButtonGroupProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  useKeyboard((key) => {
    if (key.name === 'leftArrow') {
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else if (key.name === 'rightArrow') {
      setSelectedIndex((i) => Math.min(buttons.length - 1, i + 1));
    } else if (key.name === 'return') {
      buttons[selectedIndex].onClick();
    }
  });

  return (
    <box gap={2}>
      {buttons.map((button, index) => (
        <box key={index} borderStyle={index === selectedIndex ? 'double' : 'single'} paddingX={2}>
          <text
            color={
              index === selectedIndex
                ? button.variant === 'danger'
                  ? 'red'
                  : '#FFFFC5'
                : undefined
            }
            bold={index === selectedIndex}
          >
            {button.label}
          </text>
        </box>
      ))}
    </box>
  );
}

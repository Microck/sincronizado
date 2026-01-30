import React from 'react';
import { Box, Text, useInput } from '@opentui/react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  useInput((_, key) => {
    if (isFocused && key.return) {
      onClick();
    }
  });

  const color = variant === 'danger' ? 'red' : variant === 'secondary' ? 'gray' : '#FFFFC5';

  return (
    <Box borderStyle={isFocused ? 'double' : 'single'} paddingX={2}>
      <Text color={isFocused ? color : undefined} bold={isFocused}>
        {label}
      </Text>
    </Box>
  );
}

interface ButtonGroupProps {
  buttons: { label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'danger' }[];
}

export function ButtonGroup({ buttons }: ButtonGroupProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  useInput((_, key) => {
    if (key.leftArrow) {
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else if (key.rightArrow) {
      setSelectedIndex((i) => Math.min(buttons.length - 1, i + 1));
    } else if (key.return) {
      buttons[selectedIndex].onClick();
    }
  });

  return (
    <Box gap={2}>
      {buttons.map((button, index) => (
        <Box key={index} borderStyle={index === selectedIndex ? 'double' : 'single'} paddingX={2}>
          <Text
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
          </Text>
        </Box>
      ))}
    </Box>
  );
}

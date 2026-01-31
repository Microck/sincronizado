import React from 'react';
import { useKeyboard } from '@opentui/react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextInput({ label, value, onChange, placeholder }: TextInputProps) {
  const [cursorPosition, setCursorPosition] = React.useState(value.length);
  const [isFocused, setIsFocused] = React.useState(false);

  useKeyboard((key) => {
    if (!isFocused) return;

    if (key.name === 'return') {
      setIsFocused(false);
      return;
    }

    if (key.name === 'backspace' || key.name === 'delete') {
      if (cursorPosition > 0) {
        const newValue = value.slice(0, cursorPosition - 1) + value.slice(cursorPosition);
        onChange(newValue);
        setCursorPosition(cursorPosition - 1);
      }
      return;
    }

    if (key.name === 'left') {
      setCursorPosition((p) => Math.max(0, p - 1));
      return;
    }

    if (key.name === 'right') {
      setCursorPosition((p) => Math.min(value.length, p + 1));
      return;
    }

    if (key.sequence && !key.ctrl && !key.meta && key.name.length === 1) {
      const newValue = value.slice(0, cursorPosition) + key.sequence + value.slice(cursorPosition);
      onChange(newValue);
      setCursorPosition(cursorPosition + key.sequence.length);
    }
  });

  return (
    <box flexDirection="column">
      <text>{label}:</text>
      <box borderStyle={isFocused ? 'rounded' : 'single'} padding={1}>
        <text>{value || placeholder || ''}</text>
      </box>
    </box>
  );
}

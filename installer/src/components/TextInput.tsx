import React from "react";
import { Box, Text, useInput } from "@opentui/react";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextInput({ label, value, onChange, placeholder }: TextInputProps) {
  const [cursorPosition, setCursorPosition] = React.useState(value.length);
  const [isFocused, setIsFocused] = React.useState(false);

  useInput((input, key) => {
    if (!isFocused) return;

    if (key.return) {
      setIsFocused(false);
      return;
    }

    if (key.backspace || key.delete) {
      if (cursorPosition > 0) {
        const newValue = value.slice(0, cursorPosition - 1) + value.slice(cursorPosition);
        onChange(newValue);
        setCursorPosition(cursorPosition - 1);
      }
      return;
    }

    if (key.leftArrow) {
      setCursorPosition((p) => Math.max(0, p - 1));
      return;
    }

    if (key.rightArrow) {
      setCursorPosition((p) => Math.min(value.length, p + 1));
      return;
    }

    if (input) {
      const newValue = value.slice(0, cursorPosition) + input + value.slice(cursorPosition);
      onChange(newValue);
      setCursorPosition(cursorPosition + input.length);
    }
  });

  return (
    <Box flexDirection="column">
      <Text>{label}:</Text>
      <Box borderStyle={isFocused ? "round" : "single"} paddingX={1}>
        <Text>{value || placeholder || ""}</Text>
      </Box>
    </Box>
  );
}

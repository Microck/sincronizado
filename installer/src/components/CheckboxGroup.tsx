import React from "react";
import { Box, Text, useInput } from "@opentui/react";

interface CheckboxGroupProps {
  options: { value: string; label: string; description?: string }[];
  values: string[];
  onChange: (values: string[]) => void;
}

export function CheckboxGroup({
  options,
  values,
  onChange,
}: CheckboxGroupProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  useInput((_, key) => {
    if (key.upArrow) {
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setSelectedIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (key.space) {
      const option = options[selectedIndex];
      if (values.includes(option.value)) {
        onChange(values.filter((v) => v !== option.value));
      } else {
        onChange([...values, option.value]);
      }
    }
  });

  return (
    <Box flexDirection="column">
      {options.map((option, index) => (
        <Box key={option.value}>
          <Text>
            {index === selectedIndex ? "> " : "  "}
            {values.includes(option.value) ? "[x] " : "[ ] "}
            {option.label}
            {index === selectedIndex && option.description && (
              <Text dimColor> — {option.description}</Text>
            )}
          </Text>
        </Box>
      ))}
      <Box paddingTop={1}>
        <Text dimColor>Press space to toggle, arrow keys to navigate</Text>
      </Box>
    </Box>
  );
}

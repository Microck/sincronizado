import React from "react";
import { Box, Text, useInput } from "@opentui/react";

interface RadioGroupProps<T> {
  options: { value: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: RadioGroupProps<T>) {
  const [selectedIndex, setSelectedIndex] = React.useState(() =>
    options.findIndex((o) => o.value === value)
  );

  useInput((_, key) => {
    if (key.upArrow) {
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setSelectedIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (key.return) {
      onChange(options[selectedIndex].value);
    }
  });

  return (
    <Box flexDirection="column">
      {options.map((option, index) => (
        <Box key={option.value}>
          <Text>
            {index === selectedIndex ? "● " : "○ "}
            {option.label}
            {index === selectedIndex && option.description && (
              <Text dimColor> — {option.description}</Text>
            )}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

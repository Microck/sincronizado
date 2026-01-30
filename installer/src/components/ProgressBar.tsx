import React from "react";
import { Box, Text } from "@opentui/react";

interface ProgressBarProps {
  progress: number;
  label: string;
  status?: "pending" | "running" | "complete" | "error";
}

export function ProgressBar({ progress, label, status = "pending" }: ProgressBarProps) {
  const width = 40;
  const filled = Math.round((progress / 100) * width);
  const empty = width - filled;

  const statusIcon = {
    pending: "○",
    running: "●",
    complete: "✓",
    error: "✗",
  }[status];

  const statusColor = {
    pending: "gray",
    running: "cyan",
    complete: "green",
    error: "red",
  }[status];

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={statusColor}>
          {statusIcon} {label}
        </Text>
      </Box>
      <Box>
        <Text color="cyan">{"█".repeat(filled)}</Text>
        <Text dimColor>{"░".repeat(empty)}</Text>
        <Text> {Math.round(progress)}%</Text>
      </Box>
    </Box>
  );
}

import React from "react";
import { Box, Text } from "@opentui/react";
import { RadioGroup } from "../components/RadioGroup.js";
import { ButtonGroup } from "../components/Button.js";
import type { InstallConfig, InstallMode } from "../App.js";

interface ModeSelectProps {
  config: InstallConfig;
  onChange: (updates: Partial<InstallConfig>) => void;
  onContinue: () => void;
  onBack: () => void;
}

const modes: { value: InstallMode; label: string; description: string }[] = [
  {
    value: "minimal",
    label: "Minimal",
    description: "Core only: OpenCode, Eternal Terminal, UFW",
  },
  {
    value: "standard",
    label: "Standard",
    description: "Recommended: + Agent-OS, ccmanager, plugins",
  },
  {
    value: "full",
    label: "Full",
    description: "Everything: + kimaki, session-handoff, worktree-session",
  },
  {
    value: "custom",
    label: "Custom",
    description: "Pick individual components",
  },
];

export function ModeSelect({ config, onChange, onContinue, onBack }: ModeSelectProps) {
  return (
    <Box flexDirection="column" paddingTop={2}>
      <Box paddingBottom={1}>
        <Text>Select your installation mode:</Text>
      </Box>
      <Box paddingBottom={2}>
        <RadioGroup
          options={modes}
          value={config.mode}
          onChange={(mode) => onChange({ mode })}
        />
      </Box>
      <Box paddingTop={2}>
        <ButtonGroup
          buttons={[
            { label: "Continue", onClick: onContinue, variant: "primary" },
            { label: "Back", onClick: onBack, variant: "secondary" },
          ]}
        />
      </Box>
    </Box>
  );
}

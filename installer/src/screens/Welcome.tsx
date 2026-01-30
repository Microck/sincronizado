import React from "react";
import { Box, Text } from "@opentui/react";
import { ButtonGroup } from "../components/Button.js";

interface WelcomeProps {
  onContinue: () => void;
  onExit: () => void;
}

export function Welcome({ onContinue, onExit }: WelcomeProps) {
  return (
    <Box flexDirection="column" paddingTop={2}>
      <Box paddingBottom={1}>
        <Text>
          This installer will set up your VPS with the Sincronizado development environment.
        </Text>
      </Box>
      <Box paddingBottom={1}>
        <Text dimColor>
          You will be guided through selecting:
        </Text>
      </Box>
      <Box paddingLeft={2}>
        <Text dimColor>• Installation mode (Minimal/Standard/Full)</Text>
        <Text dimColor>• Optional add-ons (Discord bot, AI proxy, etc.)</Text>
        <Text dimColor>• VPS provider and connection details</Text>
      </Box>
      <Box paddingTop={2} paddingBottom={1}>
        <Text>
          Press tab/shift+tab to navigate, enter to select.
        </Text>
      </Box>
      <Box paddingTop={2}>
        <ButtonGroup
          buttons={[
            { label: "Continue", onClick: onContinue, variant: "primary" },
            { label: "Exit", onClick: onExit, variant: "secondary" },
          ]}
        />
      </Box>
    </Box>
  );
}

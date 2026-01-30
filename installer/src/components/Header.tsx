import React from "react";
import { Box, Text } from "@opentui/react";
import type { Screen } from "../App.js";

const screenTitles: Record<Screen, string> = {
  welcome: "Welcome",
  mode: "Installation Mode",
  addons: "Select Add-ons",
  provider: "VPS Provider",
  config: "Configuration",
  confirm: "Confirm Installation",
  install: "Installing...",
  complete: "Complete",
};

export function Header({ screen }: { screen: Screen }) {
  return (
    <Box flexDirection="column" paddingBottom={1}>
      <Box>
        <Text bold color="cyan">
          ╔══════════════════════════════════════════════════════════╗
        </Text>
      </Box>
      <Box>
        <Text bold color="cyan">
          ║
        </Text>
        <Text bold color="white">
          {"           SINCRONIZADO INSTALLER v1.1.0            "}
        </Text>
        <Text bold color="cyan">
          ║
        </Text>
      </Box>
      <Box>
        <Text bold color="cyan">
          ╚══════════════════════════════════════════════════════════╝
        </Text>
      </Box>
      <Box paddingTop={1}>
        <Text dimColor>
          {"  "}
          {screenTitles[screen]}
        </Text>
      </Box>
    </Box>
  );
}

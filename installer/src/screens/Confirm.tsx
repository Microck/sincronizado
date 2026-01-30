import React from "react";
import { Box, Text } from "@opentui/react";
import { ButtonGroup } from "../components/Button.js";
import type { InstallConfig } from "../App.js";

interface ConfirmProps {
  config: InstallConfig;
  onInstall: () => void;
  onBack: () => void;
}

export function Confirm({ config, onInstall, onBack }: ConfirmProps) {
  const renderAddons = () => {
    const addons: string[] = [];
    if (config.withKimaki) addons.push("Kimaki");
    if (config.withLunaroute) addons.push("LunaRoute");
    if (config.withWorktreeSession) addons.push("Worktree Sessions");
    if (config.withSessionHandoff) addons.push("Session Handoff");
    if (config.withAgentOfEmpires) addons.push("Agent of Empires");

    if (addons.length === 0) return "None";
    return addons.join(", ");
  };

  const renderSkips = () => {
    const skips: string[] = [];
    if (config.noAgentOS) skips.push("Agent-OS");
    if (config.noCcmanager) skips.push("ccmanager");
    if (config.noPlugins) skips.push("OpenCode plugins");

    if (skips.length === 0) return "None";
    return skips.join(", ");
  };

  return (
    <Box flexDirection="column" paddingTop={2}>
      <Box paddingBottom={1}>
        <Text bold>Review your installation:</Text>
      </Box>
      <Box paddingLeft={2}>
        <Text>
          <Text bold>Mode:</Text> {config.mode}
        </Text>
        <Text>
          <Text bold>Provider:</Text> {config.provider}
        </Text>
        <Text>
          <Text bold>Hostname:</Text> {config.hostname || "<not set>"}
        </Text>
        <Text>
          <Text bold>SSH User:</Text> {config.sshUser}
        </Text>
        <Text>
          <Text bold>Add-ons:</Text> {renderAddons()}
        </Text>
        <Text>
          <Text bold>Skip:</Text> {renderSkips()}
        </Text>
      </Box>
      <Box paddingTop={2}>
        <Text dimColor>
          This will SSH into your VPS and run the installation script.
        </Text>
      </Box>
      <Box paddingTop={3}>
        <ButtonGroup
          buttons={[
            { label: "Install", onClick: onInstall, variant: "primary" },
            { label: "Back", onClick: onBack, variant: "secondary" },
          ]}
        />
      </Box>
    </Box>
  );
}

import React from "react";
import { Box, Text } from "@opentui/react";
import { CheckboxGroup } from "../components/CheckboxGroup.js";
import { ButtonGroup } from "../components/Button.js";
import type { InstallConfig } from "../App.js";

interface AddonsProps {
  config: InstallConfig;
  onChange: (updates: Partial<InstallConfig>) => void;
  onContinue: () => void;
  onBack: () => void;
}

const addonOptions = [
  {
    value: "withKimaki",
    label: "Kimaki (Discord Bot)",
    description: "Control agents via Discord with voice support",
  },
  {
    value: "withLunaroute",
    label: "LunaRoute (AI Proxy)",
    description: "Debug AI interactions and track token usage",
  },
  {
    value: "withWorktreeSession",
    label: "Worktree Sessions",
    description: "Git worktree per OpenCode session",
  },
  {
    value: "withSessionHandoff",
    label: "Session Handoff",
    description: "Seamless context continuation between sessions",
  },
  {
    value: "withAgentOfEmpires",
    label: "Agent of Empires",
    description: "Alternative session manager (replaces ccmanager)",
  },
];

const skipOptions = [
  {
    value: "noAgentOS",
    label: "Skip Agent-OS",
    description: "No web UI for mobile access",
  },
  {
    value: "noCcmanager",
    label: "Skip ccmanager",
    description: "No session TUI (use agent-of-empires instead)",
  },
  {
    value: "noPlugins",
    label: "Skip OpenCode plugins",
    description: "No direnv, agentmap, sync, ai-sessions",
  },
];

export function Addons({ config, onChange, onContinue, onBack }: AddonsProps) {
  const selectedAddons = [
    ...(config.withKimaki ? ["withKimaki"] : []),
    ...(config.withLunaroute ? ["withLunaroute"] : []),
    ...(config.withWorktreeSession ? ["withWorktreeSession"] : []),
    ...(config.withSessionHandoff ? ["withSessionHandoff"] : []),
    ...(config.withAgentOfEmpires ? ["withAgentOfEmpires"] : []),
  ];

  const selectedSkips = [
    ...(config.noAgentOS ? ["noAgentOS"] : []),
    ...(config.noCcmanager ? ["noCcmanager"] : []),
    ...(config.noPlugins ? ["noPlugins"] : []),
  ];

  const handleAddonChange = (values: string[]) => {
    onChange({
      withKimaki: values.includes("withKimaki"),
      withLunaroute: values.includes("withLunaroute"),
      withWorktreeSession: values.includes("withWorktreeSession"),
      withSessionHandoff: values.includes("withSessionHandoff"),
      withAgentOfEmpires: values.includes("withAgentOfEmpires"),
      noCcmanager: values.includes("withAgentOfEmpires"),
    });
  };

  const handleSkipChange = (values: string[]) => {
    onChange({
      noAgentOS: values.includes("noAgentOS"),
      noCcmanager: values.includes("noCcmanager"),
      noPlugins: values.includes("noPlugins"),
    });
  };

  return (
    <Box flexDirection="column" paddingTop={2}>
      <Box paddingBottom={1}>
        <Text bold>Add optional features:</Text>
      </Box>
      <Box paddingBottom={1}>
        <CheckboxGroup options={addonOptions} values={selectedAddons} onChange={handleAddonChange} />
      </Box>
      <Box paddingTop={1} paddingBottom={1}>
        <Text bold>Skip default components:</Text>
      </Box>
      <Box paddingBottom={2}>
        <CheckboxGroup options={skipOptions} values={selectedSkips} onChange={handleSkipChange} />
      </Box>
      <Box paddingTop={1}>
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

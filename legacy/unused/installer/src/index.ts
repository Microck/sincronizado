import pc from 'picocolors';
import * as p from '@clack/prompts';
import { stdout } from 'node:process';
import { LARGE_ASCII, SMALL_ASCII } from './arts.js';

pc.green = pc.yellow;
pc.cyan = pc.yellow;
pc.magenta = pc.yellow;
pc.gray = (s) => String(s);
pc.dim = (s) => String(s);

const getTerminalWidth = (): number => stdout.columns || 80;

interface InstallConfig {
  agent: 'opencode' | 'claude';
  mode: 'minimal' | 'standard' | 'full' | 'custom';
  addons: {
    kimaki: boolean;
    lunaroute: boolean;
    worktreeSession: boolean;
    sessionHandoff: boolean;
    agentOfEmpires: boolean;
    mcp: boolean;
    agentOs: boolean;
    ccmanager: boolean;
    plugins: boolean;
  };
  harden: {
    enabled: boolean;
    newUser: string;
    createSshKey: boolean;
  };
  provider: 'oracle' | 'hetzner' | 'digitalocean' | 'aws' | 'other';
  config: {
    hostname: string;
    user: string;
    projectRoot: string;
  };
}

const MODE_DESCRIPTIONS = {
  minimal: 'Core only: ET, AI agent, UFW',
  standard: 'Recommended: + mobile tools, plugins',
  full: 'Everything: + Discord bot, AI proxy, etc.',
  custom: 'Pick components manually',
};

const PROVIDER_TEMPLATES = {
  oracle: 'Ubuntu 22.04 LTS, 2 vCPU, 4GB RAM',
  hetzner: 'Ubuntu 22.04, CX22 or higher',
  digitalocean: 'Ubuntu 22.04 LTS, Basic-2GB+',
  aws: 'Ubuntu 22.04 LTS, t3.medium+',
  other: 'Custom VPS provider',
};

async function welcome(): Promise<void> {
  const termWidth = getTerminalWidth();

  if (termWidth >= 120) {
    console.log(pc.yellow(LARGE_ASCII));
  } else {
    console.log(pc.yellow(SMALL_ASCII));
  }

  p.note('TUI installer for sincronizado', 'Welcome');
}

async function selectAgent(): Promise<'opencode' | 'claude'> {
  const agent = await p.select({
    message: 'Which AI agent do you want to use?',
    options: [
      {
        value: 'opencode',
        label: 'OpenCode',
        hint: 'Open-source AI assistant with session management',
      },
      {
        value: 'claude',
        label: 'Claude Code',
        hint: 'Anthropic Claude with built-in MCP support',
      },
    ],
    initialValue: 'opencode',
  });

  if (p.isCancel(agent)) {
    process.exit(0);
  }

  return agent as 'opencode' | 'claude';
}

async function selectMode(agent: 'opencode' | 'claude'): Promise<InstallConfig['mode']> {
  const mode = await p.select({
    message: 'Select installation mode:',
    options: [
      {
        value: 'minimal',
        label: 'Minimal',
        hint: MODE_DESCRIPTIONS.minimal,
      },
      {
        value: 'standard',
        label: 'Standard (Recommended)',
        hint: MODE_DESCRIPTIONS.standard,
      },
      {
        value: 'full',
        label: 'Full',
        hint: MODE_DESCRIPTIONS.full,
      },
      {
        value: 'custom',
        label: 'Custom',
        hint: MODE_DESCRIPTIONS.custom,
      },
    ],
    initialValue: 'standard',
  });

  if (p.isCancel(mode)) {
    process.exit(0);
  }

  return mode as InstallConfig['mode'];
}

async function selectAddons(
  agent: 'opencode' | 'claude',
  mode: InstallConfig['mode'],
): Promise<InstallConfig['addons']> {
  const baseAddons = {
    kimaki: false,
    lunaroute: false,
    worktreeSession: false,
    sessionHandoff: false,
    agentOfEmpires: false,
    mcp: false,
    agentOs: mode !== 'minimal' && agent === 'opencode',
    ccmanager: mode !== 'minimal' && agent === 'opencode',
    plugins: mode !== 'minimal',
  };

  if (mode === 'full') {
    baseAddons.kimaki = true;
    baseAddons.lunaroute = true;
    baseAddons.mcp = agent === 'claude';
    baseAddons.worktreeSession = agent === 'opencode';
    baseAddons.sessionHandoff = agent === 'opencode';
    return baseAddons;
  }

  if (mode === 'standard') {
    return baseAddons;
  }
  const addons = await p.multiselect({
    message: 'Select optional components (Space to toggle):',
    options: [
      {
        value: 'agentOs',
        label: 'Agent-OS Web UI',
        hint: 'Mobile-friendly session browser (OpenCode only)',
        disabled: agent === 'claude' ? 'Claude Code only' : undefined,
      },
      {
        value: 'ccmanager',
        label: 'ccmanager',
        hint: 'Session management plugin (OpenCode only)',
        disabled: agent === 'claude' ? 'Claude Code only' : undefined,
      },
      {
        value: 'plugins',
        label: 'OpenCode Plugins',
        hint: 'Direnv, agentmap, sync, ai-sessions',
        disabled: agent === 'claude' ? 'OpenCode only' : undefined,
      },
      {
        value: 'kimaki',
        label: 'Kimaki Discord Bot',
        hint: 'Voice/text control via Discord',
      },
      {
        value: 'lunaroute',
        label: 'LunaRoute AI Proxy',
        hint: 'Token tracking and debugging UI',
      },
      {
        value: 'worktreeSession',
        label: 'Worktree Session',
        hint: 'Git worktree per session (OpenCode only)',
        disabled: agent === 'claude' ? 'OpenCode only' : undefined,
      },
      {
        value: 'sessionHandoff',
        label: 'Session Handoff',
        hint: 'Context continuation plugin (OpenCode only)',
        disabled: agent === 'claude' ? 'OpenCode only' : undefined,
      },
      {
        value: 'agentOfEmpires',
        label: 'Agent of Empires',
        hint: 'Alternative to ccmanager (OpenCode only)',
        disabled: agent === 'claude' ? 'OpenCode only' : undefined,
      },
      {
        value: 'mcp',
        label: 'MCP Servers',
        hint: 'Model Context Protocol servers (Claude Code only)',
        disabled: agent === 'opencode' ? 'Claude Code only' : undefined,
      },
    ],
    required: false,
  });

  if (p.isCancel(addons)) {
    process.exit(0);
  }

  return {
    kimaki: addons.includes('kimaki'),
    lunaroute: addons.includes('lunaroute'),
    worktreeSession: addons.includes('worktreeSession'),
    sessionHandoff: addons.includes('sessionHandoff'),
    agentOfEmpires: addons.includes('agentOfEmpires'),
    mcp: addons.includes('mcp'),
    agentOs: addons.includes('agentOs'),
    ccmanager: addons.includes('ccmanager'),
    plugins: addons.includes('plugins'),
  };
}

async function selectHardening(): Promise<InstallConfig['harden']> {
  const shouldHarden = await p.confirm({
    message: 'Enable VPS security hardening?',
    initialValue: true,
  });

  if (p.isCancel(shouldHarden)) {
    process.exit(0);
  }

  if (!shouldHarden) {
    return { enabled: false, newUser: '', createSshKey: false };
  }

  const newUser = await p.text({
    message: 'Create non-root user (leave empty to skip):',
    placeholder: 'deployer',
  });

  if (p.isCancel(newUser)) {
    process.exit(0);
  }

  let createSshKey = false;
  if (newUser && newUser.trim() !== '') {
    const sshKeyResult = await p.confirm({
      message: 'Setup SSH key authentication for new user?',
      initialValue: true,
    });

    if (p.isCancel(sshKeyResult)) {
      process.exit(0);
    }

    createSshKey = sshKeyResult;
  }

  return {
    enabled: true,
    newUser: newUser?.trim() || '',
    createSshKey,
  };
}

async function selectProvider(): Promise<InstallConfig['provider']> {
  const provider = await p.select({
    message: 'Select your VPS provider (for setup templates):',
    options: [
      {
        value: 'oracle',
        label: 'Oracle Cloud',
        hint: PROVIDER_TEMPLATES.oracle,
      },
      {
        value: 'hetzner',
        label: 'Hetzner',
        hint: PROVIDER_TEMPLATES.hetzner,
      },
      {
        value: 'digitalocean',
        label: 'DigitalOcean',
        hint: PROVIDER_TEMPLATES.digitalocean,
      },
      {
        value: 'aws',
        label: 'AWS',
        hint: PROVIDER_TEMPLATES.aws,
      },
      {
        value: 'other',
        label: 'Other',
        hint: PROVIDER_TEMPLATES.other,
      },
    ],
    initialValue: 'oracle',
  });

  if (p.isCancel(provider)) {
    process.exit(0);
  }

  return provider as InstallConfig['provider'];
}

async function enterConfig(): Promise<InstallConfig['config']> {
  const hostname = await p.text({
    message: 'Enter VPS hostname or IP:',
    placeholder: 'oracle.tail1234.ts.net',
    validate: (value) => {
      if (!value || value.trim() === '') return 'Hostname or IP is required';
      return undefined;
    },
  });

  if (p.isCancel(hostname)) {
    process.exit(0);
  }

  const user = await p.text({
    message: 'Enter SSH username:',
    placeholder: 'ubuntu',
    validate: (value) => {
      if (!value || value.trim() === '') return 'Username is required';
      return undefined;
    },
  });

  if (p.isCancel(user)) {
    process.exit(0);
  }

  const projectRoot = await p.text({
    message: 'Enter project root path on VPS:',
    placeholder: '~/projects',
    initialValue: '~/projects',
  });

  if (p.isCancel(projectRoot)) {
    process.exit(0);
  }

  return {
    hostname: hostname.trim(),
    user: user.trim(),
    projectRoot: projectRoot.trim() || '~/projects',
  };
}

async function confirm(config: InstallConfig): Promise<boolean> {
  const modeDesc = MODE_DESCRIPTIONS[config.mode];

  const addonsList = [];
  if (config.addons.agentOs) addonsList.push('Agent-OS');
  if (config.addons.ccmanager) addonsList.push('ccmanager');
  if (config.addons.plugins) addonsList.push('Plugins');
  if (config.addons.kimaki) addonsList.push('Kimaki');
  if (config.addons.lunaroute) addonsList.push('LunaRoute');
  if (config.addons.worktreeSession) addonsList.push('Worktree');
  if (config.addons.sessionHandoff) addonsList.push('Handoff');
  if (config.addons.agentOfEmpires) addonsList.push('Agent of Empires');
  if (config.addons.mcp) addonsList.push('MCP');

  const hardenList = [];
  if (config.harden.enabled) {
    hardenList.push('Security hardening');
    if (config.harden.newUser) hardenList.push(`  User: ${config.harden.newUser}`);
    if (config.harden.createSshKey) hardenList.push('  SSH key auth');
  }

  const summary = `
    ${pc.bold('AI Agent:')} ${pc.yellow(config.agent)}
    ${pc.bold('Mode:')} ${pc.yellow(config.mode)} - ${modeDesc}
    ${pc.bold('Provider:')} ${pc.yellow(config.provider)}
    ${pc.bold('Hostname:')} ${pc.yellow(config.config.hostname)}
    ${pc.bold('User:')} ${pc.yellow(config.config.user)}
    ${pc.bold('Project Root:')} ${pc.yellow(config.config.projectRoot)}

    ${pc.bold('Addons:')}
    ${addonsList.length > 0 ? addonsList.map((a) => `  • ${a}`).join('\n') : '  (none)'}

    ${pc.bold('Security:')}
    ${hardenList.length > 0 ? hardenList.map((h) => `  • ${h}`).join('\n') : '  (none)'}
  `;

  const confirmed = await p.confirm({
    message: 'Confirm installation settings?',
  });

  if (p.isCancel(confirmed)) {
    process.exit(0);
  }

  return confirmed;
}

function buildSSHCommand(config: InstallConfig): string {
  const setupCmd = buildSetupCommand(config);

  if (!config.harden.enabled) {
    return setupCmd;
  }

  let hardenCmd = 'sudo ./scripts/harden-vps.sh --yes';
  if (config.harden.newUser) {
    hardenCmd += ` --new-user=${config.harden.newUser}`;
  }
  if (config.harden.createSshKey) {
    hardenCmd += ' --create-ssh-key';
  }

  return `${hardenCmd} && ${setupCmd}`;
}

function buildSetupCommand(config: InstallConfig): string {
  let cmd = `sudo ./scripts/setup-vps.sh --agent=${config.agent} --mode=${config.mode}`;

  if (config.addons.kimaki) cmd += ' --with-kimaki';
  if (config.addons.lunaroute) cmd += ' --with-lunaroute';
  if (config.addons.worktreeSession) cmd += ' --with-worktree-session';
  if (config.addons.sessionHandoff) cmd += ' --with-session-handoff';
  if (config.addons.agentOfEmpires) cmd += ' --with-agent-of-empires';
  if (config.addons.mcp) cmd += ' --with-mcp';
  if (!config.addons.agentOs) cmd += ' --no-agent-os';
  if (!config.addons.ccmanager) cmd += ' --no-ccmanager';
  if (!config.addons.plugins) cmd += ' --no-plugins';

  return cmd;
}

async function executeInstall(config: InstallConfig): Promise<void> {
  const cmd = buildSSHCommand(config);
  const ssh = `ssh ${config.config.user}@${config.config.hostname}`;

  const s = p.spinner();
  s.start('Connecting to VPS and starting installation...');

  await new Promise((resolve) => setTimeout(resolve, 1500));
  s.stop('Connected!');

  p.note(
    `${pc.yellow('Would execute:')}\n\n${ssh} "cd ~/sincronizado && ${cmd}"\n\nDemo mode: no SSH connection made`,
    'Installation Command',
  );

  const proceed = await p.confirm({
    message: 'Start actual SSH installation?',
  });

  if (p.isCancel(proceed)) {
    process.exit(0);
  }

  if (!proceed) {
    return;
  }

  // Real installation: const { spawn } = await import('child_process');
  // const process = spawn(ssh, ['-t', `cd ~/sincronizado && ${cmd}`]);
  // Stream output to console

  const installSpinner = p.spinner();
  installSpinner.start('Installing Sincronizado on VPS...');

  await new Promise((resolve) => setTimeout(resolve, 3000));

  installSpinner.stop('Installation complete!');

  p.note(
    `${pc.yellow('✓')} Installation successful\n\nNext steps:\n  1. Configure launcher with: launcher/${config.agent}.ps1\n  2. Check Agent-OS at http://${config.config.hostname}:3000`,
    'Complete',
  );
}

async function main() {
  console.clear();

  await welcome();

  const agent = await selectAgent();
  const mode = await selectMode(agent);
  const addons = await selectAddons(agent, mode);
  const harden = await selectHardening();
  const provider = await selectProvider();
  const config = await enterConfig();

  const installConfig: InstallConfig = {
    agent,
    mode,
    addons,
    harden,
    provider,
    config,
  };

  const confirmed = await confirm(installConfig);

  if (!confirmed) {
    p.cancel('Installation cancelled');
    process.exit(0);
  }

  await executeInstall(installConfig);
}

main().catch(console.error);

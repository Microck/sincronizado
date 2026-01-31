import React, { useState } from 'react';
import { Welcome } from './screens/Welcome.js';
import { AgentSelect } from './screens/AgentSelect.js';
import { ModeSelect } from './screens/ModeSelect.js';
import { Addons } from './screens/Addons.js';
import { Provider } from './screens/Provider.js';
import { Config } from './screens/Config.js';
import { Confirm } from './screens/Confirm.js';
import { Install } from './screens/Install.js';
import { Complete } from './screens/Complete.js';
import { Header } from './components/Header.js';

export type Screen =
  | 'welcome'
  | 'agent'
  | 'mode'
  | 'addons'
  | 'provider'
  | 'config'
  | 'confirm'
  | 'install'
  | 'complete';

export type AIAgent = 'opencode' | 'claude';

export type InstallMode = 'minimal' | 'standard' | 'full' | 'custom';

export type VPSProvider = 'oracle' | 'hetzner' | 'digitalocean' | 'aws' | 'other';

export interface InstallConfig {
  agent: AIAgent;
  mode: InstallMode;
  withKimaki: boolean;
  withLunaroute: boolean;
  withMCP: boolean;
  withWorktreeSession: boolean;
  withSessionHandoff: boolean;
  withAgentOfEmpires: boolean;
  withOpenSync: boolean;
  setupAlias: boolean;
  noAgentOS: boolean;
  noCcmanager: boolean;
  noPlugins: boolean;
  provider: VPSProvider;
  hostname: string;
  sshUser: string;
  projectRoot: string;
}

const defaultConfig: InstallConfig = {
  agent: 'opencode',
  mode: 'standard',
  withKimaki: false,
  withLunaroute: false,
  withMCP: false,
  withWorktreeSession: false,
  withSessionHandoff: false,
  withAgentOfEmpires: false,
  withOpenSync: false,
  setupAlias: false,
  noAgentOS: false,
  noCcmanager: false,
  noPlugins: false,
  provider: 'oracle',
  hostname: '',
  sshUser: 'ubuntu',
  projectRoot: '~/projects',
};

export function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [config, setConfig] = useState<InstallConfig>(defaultConfig);
  const [history, setHistory] = useState<Screen[]>([]);

  const navigateTo = (next: Screen) => {
    setHistory((h) => [...h, screen]);
    setScreen(next);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setScreen(prev);
    }
  };

  const updateConfig = (updates: Partial<InstallConfig>) => {
    setConfig((c) => ({ ...c, ...updates }));
  };

  return (
    <box flexDirection="column" height={24}>
      <Header screen={screen} />
      {screen === 'welcome' && (
        <Welcome onContinue={() => navigateTo('agent')} onExit={() => process.exit(0)} />
      )}
      {screen === 'agent' && (
        <AgentSelect
          config={config}
          onChange={updateConfig}
          onContinue={() => navigateTo('mode')}
          onBack={goBack}
        />
      )}
      {screen === 'mode' && (
        <ModeSelect
          config={config}
          onChange={updateConfig}
          onContinue={() => navigateTo(config.mode === 'custom' ? 'addons' : 'provider')}
          onBack={goBack}
        />
      )}
      {screen === 'addons' && (
        <Addons
          config={config}
          onChange={updateConfig}
          onContinue={() => navigateTo('provider')}
          onBack={goBack}
        />
      )}
      {screen === 'provider' && (
        <Provider
          config={config}
          onChange={updateConfig}
          onContinue={() => navigateTo('config')}
          onBack={goBack}
        />
      )}
      {screen === 'config' && (
        <Config
          config={config}
          onChange={updateConfig}
          onContinue={() => navigateTo('confirm')}
          onBack={goBack}
        />
      )}
      {screen === 'confirm' && (
        <Confirm config={config} onInstall={() => navigateTo('install')} onBack={goBack} />
      )}
      {screen === 'install' && (
        <Install config={config} onComplete={() => navigateTo('complete')} onBack={goBack} />
      )}
      {screen === 'complete' && <Complete config={config} onExit={() => process.exit(0)} />}
    </box>
  );
}

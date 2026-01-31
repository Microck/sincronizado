import React, { useState, useEffect } from 'react';
import { useKeyboard } from '@opentui/react';
import { ProgressBar } from '../components/ProgressBar.js';
import { Button } from '../components/Button.js';
import type { InstallConfig } from '../App.js';
import { spawn } from 'child_process';

interface InstallProps {
  config: InstallConfig;
  onComplete: () => void;
  onBack: () => void;
}

interface InstallStep {
  name: string;
  command: string;
  progress: number;
  status: 'pending' | 'running' | 'complete' | 'error';
}

export function Install({ config, onComplete, onBack }: InstallProps) {
  const dryRun =
    process.env.SINC_DRY_RUN === '1' ||
    process.env.SINC_DRY_RUN === 'true' ||
    process.env.SINC_DEMO === '1' ||
    process.env.SINC_DEMO === 'true';
  const [steps, setSteps] = useState<InstallStep[]>([
    { name: 'Connect to VPS', command: '', progress: 0, status: 'pending' },
    { name: 'Install base dependencies', command: '', progress: 0, status: 'pending' },
    { name: 'Install Eternal Terminal', command: '', progress: 0, status: 'pending' },
    { name: 'Install OpenCode', command: '', progress: 0, status: 'pending' },
    { name: 'Install components', command: '', progress: 0, status: 'pending' },
    { name: 'Configure firewall', command: '', progress: 0, status: 'pending' },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);
  const [output, setOutput] = useState<string[]>([]);

  useEffect(() => {
    if (isCancelled) return;
    runInstallation();
  }, []);

  const runInstallation = async () => {
    const flags = buildFlags(config);
    const hostname = config.hostname || 'localhost';

    for (let i = 0; i < steps.length; i++) {
      if (isCancelled) break;

      setCurrentStep(i);
      updateStep(i, { status: 'running' });

      try {
        if (dryRun) {
          await runDryStep(i);
        } else {
          await runSSHCommand(hostname, config.sshUser, flags, i);
        }
        updateStep(i, { status: 'complete', progress: 100 });
      } catch (error) {
        updateStep(i, { status: 'error' });
        break;
      }
    }

    if (!isCancelled) {
      onComplete();
    }
  };

  const runDryStep = async (step: number) => {
    const label = steps[step]?.name || `Step ${step + 1}`;
    setOutput((prev) => [...prev.slice(-10), `[dry-run] ${label}`]);

    const ticks = [10, 35, 60, 85, 100];
    for (const t of ticks) {
      if (isCancelled) return;
      updateStep(step, { progress: t });
      await sleep(120);
    }
  };

  const runSSHCommand = (
    hostname: string,
    user: string,
    flags: string,
    step: number,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const scriptUrl =
        'https://raw.githubusercontent.com/microck/sincronizado/main/scripts/setup-vps.sh';
      const target = `${user}@${hostname}`;
      const remoteCommand = `curl -fsSL ${scriptUrl} | sudo bash -s -- ${flags}`;
      const proc = spawn('ssh', [target, remoteCommand], { stdio: ['pipe', 'pipe', 'pipe'] });

      proc.stdout?.on('data', (data) => {
        const lines = data.toString().split('\n');
        setOutput((prev) => [...prev.slice(-10), ...lines]);

        const progress = estimateProgress(lines.join('\n'), step);
        updateStep(step, { progress });
      });

      proc.stderr?.on('data', (data) => {
        setOutput((prev) => [...prev.slice(-10), data.toString().trim()]);
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Exit code: ${code}`));
        }
      });

      proc.on('error', reject);
    });
  };

  const estimateProgress = (output: string, step: number): number => {
    const markers: Record<number, string[]> = {
      0: ['Connecting', 'connected'],
      1: ['Updating packages', 'Dependencies installed'],
      2: ['Installing Eternal Terminal', 'Eternal Terminal installed'],
      3: ['Installing OpenCode', 'OpenCode installed'],
      4: ['Installing', 'installed'],
      5: ['Configuring firewall', 'Firewall configured'],
    };

    const stepMarkers = markers[step] || [];
    if (output.includes(stepMarkers[1] || '')) return 100;
    if (output.includes(stepMarkers[0] || '')) return 50;
    return 25;
  };

  const updateStep = (index: number, updates: Partial<InstallStep>) => {
    setSteps((prev) => prev.map((step, i) => (i === index ? { ...step, ...updates } : step)));
  };

  useKeyboard((key) => {
    if (key.name === 'escape') {
      setIsCancelled(true);
    }
  });

  return (
    <box flexDirection="column" paddingTop={2}>
      <box paddingBottom={1}>
        <text>Installing on {config.hostname || 'VPS'}...</text>
        <text fg="gray">{dryRun ? 'Dry run. No SSH.' : 'Press ESC to cancel'}</text>
      </box>

      <box flexDirection="column" paddingBottom={1}>
        {steps.map((step, index) => (
          <box key={step.name} paddingBottom={1}>
            <ProgressBar progress={step.progress} label={step.name} status={step.status} />
          </box>
        ))}
      </box>

      {output.length > 0 && (
        <box borderStyle="single" padding={1} height={6}>
          <text fg="gray">{output.slice(-5).join('\n')}</text>
        </box>
      )}

      {isCancelled && (
        <box paddingTop={2}>
          <Button label="Back" onClick={onBack} variant="secondary" />
        </box>
      )}
    </box>
  );
}

function buildFlags(config: InstallConfig): string {
  const flags: string[] = [`--mode=${config.mode}`];

  if (config.withKimaki) flags.push('--with-kimaki');
  if (config.withLunaroute) flags.push('--with-lunaroute');
  if (config.withWorktreeSession) flags.push('--with-worktree-session');
  if (config.withSessionHandoff) flags.push('--with-session-handoff');
  if (config.withAgentOfEmpires) flags.push('--with-agent-of-empires');
  if (config.noAgentOS) flags.push('--no-agent-os');
  if (config.noCcmanager) flags.push('--no-ccmanager');
  if (config.noPlugins) flags.push('--no-plugins');

  return flags.join(' ');
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

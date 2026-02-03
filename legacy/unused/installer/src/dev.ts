import pc from 'picocolors';
import * as p from '@clack/prompts';
import { LARGE_ASCII, SMALL_ASCII } from './arts.js';

pc.green = pc.yellow;
pc.cyan = pc.yellow;
pc.magenta = pc.yellow;
pc.gray = (s) => String(s);
pc.dim = (s) => String(s);

async function main() {
  console.clear();

  const test = await p.select({
    message: 'What do you want to test?',
    options: [
      { value: 'ascii', label: 'ASCII Arts', hint: 'Display both large and small ASCII art' },
      { value: 'prompts', label: 'All Prompts', hint: 'Test select, multiselect, confirm, text' },
      { value: 'spinner', label: 'Spinner', hint: 'Test loading spinner' },
      { value: 'colors', label: 'Color Test', hint: 'Verify yellow-only palette' },
      { value: 'note', label: 'Note/Box', hint: 'Test note and box components' },
      { value: 'hardening', label: 'Security Hardening', hint: 'Test VPS hardening options' },
      { value: 'full', label: 'Full Flow', hint: 'Run complete installer flow' },
    ],
  });

  if (p.isCancel(test)) {
    process.exit(0);
  }

  switch (test) {
    case 'ascii':
      await testAscii();
      break;
    case 'prompts':
      await testPrompts();
      break;
    case 'spinner':
      await testSpinner();
      break;
    case 'colors':
      await testColors();
      break;
    case 'note':
      await testNote();
      break;
    case 'hardening':
      await testHardening();
      break;
    case 'full':
      await testFull();
      break;
  }

  const again = await p.confirm({
    message: 'Run another test?',
  });

  if (again) {
    await main();
  }
}

async function testAscii() {
  console.clear();
  console.log(pc.yellow(LARGE_ASCII));
  p.note('Large ASCII art (120+ cols)', 'Test');

  const cont = await p.confirm({ message: 'Show small ASCII?' });
  if (!cont) return;

  console.clear();
  console.log(pc.yellow(SMALL_ASCII));
  p.note('Small ASCII art (<120 cols)', 'Test');
}

async function testPrompts() {
  console.clear();

  const text = await p.text({
    message: 'Enter some text:',
    placeholder: 'Type here...',
  });

  if (p.isCancel(text)) return;

  const select = await p.select({
    message: 'Select an option:',
    options: [
      { value: 'a', label: 'Option A', hint: 'First option' },
      { value: 'b', label: 'Option B', hint: 'Second option' },
      { value: 'c', label: 'Option C', hint: 'Third option' },
    ],
  });

  if (p.isCancel(select)) return;

  const multi = await p.multiselect({
    message: 'Select multiple (space to toggle):',
    options: [
      { value: '1', label: 'First' },
      { value: '2', label: 'Second' },
      { value: '3', label: 'Third' },
    ],
  });

  if (p.isCancel(multi)) return;

  const confirm = await p.confirm({
    message: 'Do you confirm?',
  });

  const multiStr = Array.isArray(multi) ? multi.join(', ') : String(multi);
  const selectStr = typeof select === 'string' ? select : String(select);
  const confirmStr = typeof confirm === 'boolean' ? String(confirm) : String(confirm);
  p.note(
    `Text: ${text}\nSelect: ${selectStr}\nMulti: ${multiStr}\nConfirm: ${confirmStr}`,
    'Results',
  );
}

async function testSpinner() {
  console.clear();

  const s = p.spinner();
  s.start('Loading...');

  await new Promise((r) => setTimeout(r, 2000));
  s.message('Still working...');

  await new Promise((r) => setTimeout(r, 2000));
  s.stop('Done!');
}

async function testColors() {
  console.clear();

  p.note(
    `${pc.yellow('■')} Yellow (brand color)\n${pc.yellow('■')} Yellow (selections)\n${pc.yellow('■')} Yellow (cursor)\n${pc.yellow('■')} Yellow (everything)`,
    'Color Palette',
  );

  await p.select({
    message: 'Test selection colors:',
    options: [
      { value: '1', label: 'Should be yellow' },
      { value: '2', label: 'Should be yellow' },
    ],
  });
}

async function testNote() {
  console.clear();

  p.note('This is a simple note', 'Simple');
  p.note('This is a longer note with multiple lines of text to test wrapping behavior', 'Long');
  p.note(
    `${pc.yellow('Step 1')} Install\n${pc.yellow('Step 2')} Configure\n${pc.yellow('Step 3')} Run`,
    'Steps',
  );
}

async function testFull() {
  console.clear();
  console.log(pc.yellow(LARGE_ASCII));
  p.note('TUI installer for sincronizado', 'Welcome');

  const agent = await p.select({
    message: 'Which AI agent?',
    options: [
      { value: 'opencode', label: 'OpenCode', hint: 'Open-source AI assistant' },
      { value: 'claude', label: 'Claude Code', hint: 'Anthropic Claude' },
    ],
  });

  if (p.isCancel(agent)) return;

  const mode = await p.select({
    message: 'Installation mode:',
    options: [
      { value: 'minimal', label: 'Minimal', hint: 'Core only' },
      { value: 'standard', label: 'Standard', hint: 'Recommended' },
      { value: 'full', label: 'Full', hint: 'Everything' },
      { value: 'custom', label: 'Custom', hint: 'Pick components' },
    ],
  });

  if (p.isCancel(mode)) return;

  p.note(`Selected: ${agent} + ${mode}`, 'Config');
}

async function testHardening() {
  console.clear();

  const shouldHarden = await p.confirm({
    message: 'Enable VPS security hardening?',
    initialValue: true,
  });

  if (p.isCancel(shouldHarden) || !shouldHarden) {
    p.note('Security hardening skipped', 'Result');
    return;
  }

  const newUser = await p.text({
    message: 'Create non-root user (leave empty to skip):',
    placeholder: 'deployer',
  });

  if (p.isCancel(newUser)) return;

  let createSshKey = false;
  if (newUser && newUser.trim() !== '') {
    const sshKeyResult = await p.confirm({
      message: 'Setup SSH key authentication for new user?',
      initialValue: true,
    });

    if (p.isCancel(sshKeyResult)) return;
    createSshKey = sshKeyResult;
  }

  const summary = [];
  summary.push('Security hardening: enabled');
  if (newUser?.trim()) summary.push(`New user: ${newUser.trim()}`);
  if (createSshKey) summary.push('SSH key auth: enabled');

  p.note(summary.join('\n'), 'Config');
}

main().catch(console.error);

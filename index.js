import { spawn } from 'node:child_process';

const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['tsx', 'src/index.ts'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});


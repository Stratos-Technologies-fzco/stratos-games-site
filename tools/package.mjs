// Creates dist/mystery-island.zip containing the contents of game/,
// ready to upload to /games/mystery-island/ on WordPress hosting.
// Uses the system `zip` command (or PowerShell Compress-Archive on Windows).

import { execSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(repo, 'dist');
const out = join(dist, 'mystery-island.zip');
mkdirSync(dist, { recursive: true });
rmSync(out, { force: true });

if (process.platform === 'win32') {
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${join(repo, 'game', '*')}' -DestinationPath '${out}'"`, { stdio: 'inherit' });
} else {
  execSync(`zip -rq "${out}" . -x "*.DS_Store"`, { cwd: join(repo, 'game'), stdio: 'inherit' });
}
console.log('Created ' + out);

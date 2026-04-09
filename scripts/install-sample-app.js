const { spawnSync } = require('child_process');
const path = require('path');

const sampleAppPath = path.resolve(__dirname, '..', 'sample-app');
const fallbackCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const command = process.env.npm_execpath ? process.execPath : fallbackCommand;
const args = process.env.npm_execpath ? [process.env.npm_execpath, 'install'] : ['install'];

const result = spawnSync(command, args, {
  cwd: sampleAppPath,
  stdio: 'inherit',
  shell: false
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}

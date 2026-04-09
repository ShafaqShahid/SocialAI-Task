const { spawnSync } = require('child_process');
const path = require('path');

const sampleAppPath = path.resolve(__dirname, '..', 'sample-app');
const npmCliPath = path.resolve(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');

const result = spawnSync(process.execPath, [npmCliPath, 'install'], {
  cwd: sampleAppPath,
  stdio: 'inherit',
  shell: false
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}

// Electron smoke test: launch app briefly, check splash.js was loaded and no errors
'use strict';
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const electronPath = path.resolve(__dirname, '..', 'node_modules', '.bin', 'electron.cmd');
const projectRoot = path.resolve(__dirname, '..');
const logFile = path.resolve(__dirname, '_splash6_electron.log');
const args = ['.', '--enable-logging', '--no-sandbox'];

console.log(`Spawning: ${electronPath} ${args.join(' ')}`);
console.log(`cwd: ${projectRoot}`);
console.log(`log: ${logFile}`);

// Spawn detached, kill after 8s
const fs_log = fs.openSync(logFile, 'w');
const child = spawn(electronPath, args, {
  cwd: projectRoot,
  env: { ...process.env, ELECTRON_ENABLE_LOGGING: '1' },
  stdio: ['ignore', fs_log, fs_log],
  shell: true  // .cmd files need shell on Windows
});

let killed = false;
const killTimer = setTimeout(() => {
  console.log('8s elapsed, killing electron...');
  killed = true;
  try { child.kill('SIGKILL'); } catch (e) { console.error(e); }
}, 8000);

child.on('exit', (code, signal) => {
  clearTimeout(killTimer);
  console.log(`electron exited code=${code} signal=${signal}`);
  if (killed) console.log('  (we killed it after 8s — expected)');
  fs.closeSync(fs_log);

  // Read log
  const log = fs.readFileSync(logFile, 'utf8');
  console.log('\n=== Electron log (last 80 lines) ===');
  const lines = log.split('\n');
  console.log(lines.slice(-80).join('\n'));

  // Check for splash errors / 404 / unhandled rejection
  const has404 = /404|Failed to load resource/i.test(log);
  const hasRefError = /Uncaught.*ReferenceError|Uncaught.*TypeError/i.test(log);
  const hasSplash = /Splash|intro_0[1-6]/i.test(log);

  console.log('\n=== Analysis ===');
  console.log(`  has 404: ${has404}`);
  console.log(`  has ReferenceError/TypeError: ${hasRefError}`);
  console.log(`  has Splash/intro log: ${hasSplash}`);

  if (has404) { console.log('FAIL: 404 detected'); process.exit(1); }
  if (hasRefError) { console.log('FAIL: JS error detected'); process.exit(1); }
  if (!hasSplash) { console.log('WARNING: no splash-related log'); }
  console.log('OK');
  process.exit(0);
});

child.on('error', (e) => {
  clearTimeout(killTimer);
  console.error('Failed to spawn electron:', e.message);
  process.exit(1);
});

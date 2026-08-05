/**
 * One command for the whole app: starts the API server (server/src/server.js)
 * and the Vite dev server together, and keeps the API alive.
 *
 * The admin panel talks to http://localhost:4000/api, so a frontend started on
 * its own always fails with ERR_CONNECTION_REFUSED on /api/auth/login. Running
 * both from here removes the "did I remember to start the server?" step.
 *
 *   npm run dev          → API + frontend
 *   npm run dev:web      → frontend only
 *   npm run dev:server   → API only
 */
import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';
import { existsSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const serverDir = resolve(root, 'server');
const API_PORT = Number(process.env.PORT || 4000);

const children = [];
let shuttingDown = false;

function log(label, message) {
  process.stdout.write(`[${label}] ${message}\n`);
}

/**
 * Run a command, pipe its output through, and return the child.
 * `shell` is needed for npm/npx on Windows (.cmd shims), but it wraps the process
 * in a cmd.exe we cannot reliably signal — so anything we need to restart or kill
 * (the API) is spawned without it.
 */
function run(label, command, args, cwd, shell = false) {
  const child = spawn(command, args, { cwd, shell, stdio: 'inherit' });
  child.on('error', (err) => log(label, `failed to start: ${err.message}`));
  children.push(child);
  return child;
}

/** True when something is already listening on the port. */
function portInUse(port) {
  return new Promise((done) => {
    const socket = createConnection({ port, host: '127.0.0.1' });
    const settle = (result) => {
      socket.destroy();
      done(result);
    };
    socket.setTimeout(1000);
    socket.once('connect', () => settle(true));
    socket.once('timeout', () => settle(false));
    socket.once('error', () => settle(false));
  });
}

/** Stop everything at once, so Ctrl+C never leaves an orphan on port 4000. */
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill();
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function checkServerSetup() {
  const env = resolve(serverDir, '.env');
  if (!existsSync(env)) {
    const example = resolve(serverDir, '.env.example');
    if (!existsSync(example)) {
      log('api', 'server/.env is missing and there is no .env.example to copy. See README step 2.');
      return false;
    }
    copyFileSync(example, env);
    log('api', 'created server/.env from .env.example — open it and set DATABASE_URL, ADMIN_PASSWORD and JWT_SECRET, then run npm run dev again.');
    return false;
  }
  if (!existsSync(resolve(serverDir, 'node_modules'))) {
    log('api', 'server dependencies are missing — installing them once (cd server && npm install)…');
    const install = spawn('npm', ['install'], { cwd: serverDir, shell: true, stdio: 'inherit' });
    return new Promise((done) => install.on('exit', (code) => done(code === 0)));
  }
  return true;
}

/**
 * Start the API and bring it back if it dies, so one crash doesn't break the admin panel.
 * Deliberately not `node --watch`: watch mode keeps its supervisor alive after the server
 * dies, so a crash would look healthy from here and port 4000 would stay dead. Use
 * `npm run dev:server` when you are editing server code and want reload-on-save.
 */
let quickFailures = 0;

function startApi() {
  const startedAt = process.hrtime.bigint();
  const child = run('api', process.execPath, ['src/server.js'], serverDir);

  child.on('exit', (code) => {
    if (shuttingDown) return;
    const aliveMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

    // Dying within a few seconds means it never got healthy — a bad DATABASE_URL or
    // JWT_SECRET, say. Restarting forever would just scroll the real error away.
    quickFailures = aliveMs < 5000 ? quickFailures + 1 : 0;
    if (quickFailures >= 5) {
      log('api', 'the server failed to start 5 times in a row — fix the error above (usually server/.env) and run npm run dev again. The frontend keeps running.');
      return;
    }

    log('api', `server exited (code ${code}) — restarting in 2s…`);
    setTimeout(startApi, 2000);
  });
}

async function main() {
  if (await portInUse(API_PORT)) {
    log('api', `port ${API_PORT} is already serving — reusing it. If that is a leftover server from a closed terminal, run "npm run stop" first.`);
  } else if (await checkServerSetup()) {
    startApi();
  } else {
    log('api', 'starting the frontend only. The admin panel will not be able to sign in until the API runs.');
  }

  const web = run('web', 'npx', ['vite'], root, true);
  web.on('exit', shutdown); // closing Vite ends the session
}

main();

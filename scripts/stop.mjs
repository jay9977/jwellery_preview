/**
 * Free the API port. Use when a terminal was closed without Ctrl+C and a leftover
 * server still holds port 4000 — `npm run dev` would reuse that stale process
 * instead of starting the current code.
 *
 *   npm run stop
 */
import { execFileSync } from 'node:child_process';

const port = Number(process.argv[2] || process.env.PORT || 4000);

/** PIDs listening on the port, on Windows and on macOS/Linux alike. */
function listeners() {
  try {
    if (process.platform === 'win32') {
      const out = execFileSync('netstat', ['-ano', '-p', 'TCP'], { encoding: 'utf8' });
      return [
        ...new Set(
          out
            .split('\n')
            .filter((line) => line.includes('LISTENING') && line.includes(`:${port} `))
            .map((line) => line.trim().split(/\s+/).pop())
            .filter((pid) => pid && pid !== '0')
        )
      ];
    }
    const out = execFileSync('lsof', ['-ti', `tcp:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' });
    return out.split('\n').map((pid) => pid.trim()).filter(Boolean);
  } catch {
    return []; // nothing listening — netstat/lsof exits non-zero with no matches
  }
}

const pids = listeners();
if (pids.length === 0) {
  console.log(`Port ${port} is already free.`);
} else {
  for (const pid of pids) {
    try {
      if (process.platform === 'win32') execFileSync('taskkill', ['/PID', pid, '/T', '/F']);
      else process.kill(Number(pid), 'SIGTERM');
      console.log(`Stopped process ${pid} on port ${port}.`);
    } catch (err) {
      console.error(`Could not stop process ${pid}: ${err.message}`);
    }
  }
}

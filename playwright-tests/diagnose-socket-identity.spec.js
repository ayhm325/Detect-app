import { test, expect } from '@playwright/test';
import { spawn, execSync } from 'child_process';
import path from 'path';
import net from 'net';
import fs from 'fs';
import prismaDefault from '../lib/prismaClient.js';
const prisma = prismaDefault.default ?? prismaDefault;

test.setTimeout(120000);

test('diagnose socket identity mismatch (doctor)', async ({ page, context }) => {
  // find a doctor user
  const doctor = await prisma.doctor.findFirst();
  if (!doctor) throw new Error('No doctor found in DB');
  const user = doctor.userId ? await prisma.user.findUnique({ where: { id: doctor.userId } }) : null;
  if (!user) throw new Error('Doctor has no linked user account');

  // generate dev token
  const token = execSync(`node ${path.join('scripts','create-dev-token.mjs')} ${user.email}`, { encoding: 'utf8' }).trim();

  // set cookie for auth before navigation (use url for CI compatibility)
  const cookieUrl = process.env.PW_BASE_URL || 'http://localhost:3000';
  await page.goto(cookieUrl);
    const cookieHost = new URL(cookieUrl).hostname || 'localhost';
    await context.addCookies([{ name: 'token', value: token, domain: cookieHost, path: '/', httpOnly: true, secure: false, sameSite: 'Lax' }]);

  // ensure page will connect to our test socket server port
  const testSocketPort = process.env.TEST_SOCKET_PORT || 4500;
  await page.addInitScript((p) => { window.__DEV_SOCKET_URL = `http://localhost:${p}`; }, testSocketPort);

  // spawn socket server on an isolated port and capture stdout/stderr
  const sockProc = spawn('node', [path.join('scripts','socket-server.js')], { env: { ...process.env, JWT_SECRET: process.env.JWT_SECRET || 'your-secret', SOCKET_PORT: String(testSocketPort), PORT: String(testSocketPort) } });
  const serverLogPath = path.join(process.cwd(), 'test-results', 'socket-server-diagnose.log');
  try { fs.mkdirSync(path.dirname(serverLogPath), { recursive: true }); } catch (e) {}
  const serverStream = fs.createWriteStream(serverLogPath, { flags: 'a' });
  sockProc.stdout.on('data', d => serverStream.write(String(d)));
  sockProc.stderr.on('data', d => serverStream.write(String(d)));

  // wait for port 4000
  const port = process.env.SOCKET_PORT ? Number(process.env.SOCKET_PORT) : 4000;
  let portOpen = false;
  for (let i = 0; i < 40; i++) {
    portOpen = await new Promise((resolve) => {
      const sock = net.createConnection({ port, host: '127.0.0.1' }, () => { sock.destroy(); resolve(true); });
      sock.on('error', () => resolve(false));
    });
    if (portOpen) break;
    await new Promise(r => setTimeout(r, 250));
  }
  if (!portOpen) {
    try { sockProc.kill(); } catch (e) {}
    throw new Error('Socket server did not open port ' + port);
  }

  // capture client console messages
  const logs = [];
  page.on('console', m => {
    try { logs.push({ type: m.type(), text: m.text() }); } catch (e) { logs.push({ type: 'error', text: String(m) }); }
  });

  // navigate to doctor chat
  await page.goto('/ar/doctor/chat');
  // inject diagnostic listeners into the page to capture socket events (connect_error, me)
  await page.evaluate(() => {
    try {
      window.__diag_logs = window.__diag_logs || [];
      const push = (t, v) => { try { console.log(`[DIAG] ${t} ${typeof v === 'object' ? JSON.stringify(v) : v}`); window.__diag_logs.push({ t, v }); } catch(e) { console.log('[DIAG] error serializing log'); } };
      const attach = () => {
        const sock = (globalThis.__app_socket && globalThis.__app_socket.socket) || window.__app_socket && window.__app_socket.socket;
        if (!sock) { push('no_global_socket', 'no socket object found'); return; }
        try {
          sock.on('connect_error', (err) => push('connect_error', err && err.message));
          sock.on('me', (info) => push('me', info));
          push('attached', 'listeners attached');
        } catch (e) { push('attach_error', e && e.message); }
      };
      // try immediate and also after short delay in case socket is created slightly later
      attach(); setTimeout(attach, 500);
    } catch (e) { console.log('[DIAG] injection_failed', e && e.message); }
  });

  // wait up to 6s for a DIAG console line (connect_error or me or attached)
  const diagFound = await page.waitForFunction(() => {
    try { return Array.from(document.querySelectorAll('body *')).some(n => n.textContent && n.textContent.includes('[DIAG]')); } catch (e) { return false; }
  }, null, { timeout: 6000 }).catch(() => false);

  // give some time for logs to flush
  await new Promise(r => setTimeout(r, 300));

  // write client logs
  const clientLogPath = path.join(process.cwd(), 'test-results', 'client-console-diagnose.log');
  try { fs.writeFileSync(clientLogPath, logs.map(l=>`[${l.type}] ${l.text}`).join('\n')); } catch (e) {}

  // cleanup
  try { sockProc.kill(); } catch (e) {}
  serverStream.end();

  // attach outputs to test results for user inspection
  console.log('Wrote server log to', serverLogPath);
  console.log('Wrote client console log to', clientLogPath);

  // fail test if socketMismatch UI present
  const mismatchVisible = await page.locator('text=جلسة Socket غير متطابقة').isVisible().catch(() => false);
  if (mismatchVisible) {
    // provide logs location in failure message
    throw new Error('Socket mismatch UI visible — see logs: ' + clientLogPath + ' and ' + serverLogPath);
  }
});

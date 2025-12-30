import { test, expect } from '@playwright/test';
import { spawn, execSync } from 'child_process';
import path from 'path';
import net from 'net';
import prismaDefault from '../lib/prismaClient.js';
const prisma = prismaDefault.default ?? prismaDefault;

test.setTimeout(120000);

test('clientKey idempotency: socket send (no ack) then HTTP fallback', async ({ page, context }) => {
  // 1) find a chat and patient user; create minimal fixture if not present
  let chat = await prisma.chat.findFirst();
  if (!chat) {
    // create doctor user + doctor
    const doctorUser = await prisma.user.create({ data: { email: `e2e-doctor-${Date.now()}@example.com`, password: 'changeme', fullName: 'E2E Doctor', role: 'doctor', isActive: true } });
    const doctor = await prisma.doctor.create({ data: { userId: doctorUser.id, phone: `05${Math.floor(100000000 + Math.random() * 899999999)}`, licenseNumber: `LIC-${Math.floor(Math.random() * 100000)}`, status: 'active' } });
    // create patient user + patient
    const patientUser = await prisma.user.create({ data: { email: `e2e-patient-${Date.now()}@example.com`, password: 'changeme', fullName: 'E2E Patient', role: 'patient', isActive: true } });
    const patient = await prisma.patient.create({ data: { userId: patientUser.id, fullName: patientUser.fullName, email: patientUser.email, doctorId: doctor.userId, phone: `05${Math.floor(100000000 + Math.random() * 899999999)}`, status: 'active' } });
    chat = await prisma.chat.create({ data: { doctorId: doctor.userId, patientId: patient.id } });
  }
  const chatId = chat.id;

  // find patient user email for this chat
  const patient = await prisma.patient.findUnique({ where: { id: chat.patientId } });
  const patientUser = patient && patient.userId ? await prisma.user.findUnique({ where: { id: patient.userId } }) : null;
  if (!patientUser) throw new Error('No patient user for chat');

  // 2) generate dev token for patient
  const token = execSync(`node ${path.join('scripts','create-dev-token.mjs')} ${patientUser.email}`, { encoding: 'utf8' }).trim();

  // 3) set cookie for auth (use url so it works in CI and local)
  const cookieUrl = process.env.PW_BASE_URL || (globalThis?.__PW_BASE_URL__ ?? 'http://localhost');
  await context.addCookies([{ name: 'token', value: token, url: cookieUrl, path: '/' }]);

  // 4) ensure socket server is running (spawn in test)
  const sockProc = spawn('node', [path.join('scripts','socket-server.js')], { stdio: ['ignore', 'pipe', 'pipe'] });

  // wait for TCP port 4000 to be open (max 10s)
  const port = process.env.SOCKET_PORT ? Number(process.env.SOCKET_PORT) : 4000;
  let portOpen = false;
  for (let i = 0; i < 20; i++) {
    portOpen = await new Promise((resolve) => {
      const sock = net.createConnection({ port, host: '127.0.0.1' }, () => {
        sock.destroy();
        resolve(true);
      });
      sock.on('error', () => { resolve(false); });
    });
    if (portOpen) break;
    await new Promise(r => setTimeout(r, 500));
  }
  if (!portOpen) {
    sockProc.kill();
    throw new Error('Socket server did not open port ' + port);
  }

  // 5) open the chat page (locale 'ar' exists in app)
  await page.goto('/ar/patient/chat');

  // wait for client socket to be initialized
  await page.waitForFunction(() => !!window.__app_socket && !!window.__app_socket.socket, null, { timeout: 10000 });

  // 6) patch socket.emit to drop ack callback for 'message' events
  await page.evaluate(() => {
    const sock = window.__app_socket.socket;
    const originalEmit = sock.emit.bind(sock);
    sock.__originalEmit = originalEmit;
    sock.emit = function(event, ...args) {
      if (event === 'message') {
        // remove callback if present to simulate ack loss
        const filtered = args.filter(a => typeof a !== 'function');
        return originalEmit(event, ...filtered);
      }
      return originalEmit(event, ...args);
    };
  });

  // join the chat room
  await page.evaluate((cid) => {
    window.__app_socket.socket.emit('join', cid);
  }, chatId);

  // generate clientKey and send message via socket (no ack will be received)
  const clientKey = `pwplay-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  await page.evaluate(({ cid, text, key }) => {
    window.__app_socket.socket.emit('message', { chatId: cid, text, clientKey: key });
  }, { cid: chatId, text: 'Playwright E2E idempotent message', key: clientKey });

  // short wait to let server process (but no ack delivered)
  await new Promise(r => setTimeout(r, 700));

  // 7) perform HTTP fallback POST with same clientKey
  const postResp = await page.evaluate(async ({ cid, text, key }) => {
    const res = await fetch(`/api/chat/${cid}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ text, clientKey: key }) });
    return { status: res.status, body: await res.json() };
  }, { cid: chatId, text: 'Playwright E2E idempotent message', key: clientKey });

  expect([200,201]).toContain(postResp.status);

  // 8) verify single DB row for chatId+clientKey
  const dbMatches = await prisma.message.findMany({ where: { chatId, clientKey } });
  expect(dbMatches.length).toBe(1);

  // 9) verify the message can be retrieved from the API (UI may not auto-refresh)
  const apiCheck = await page.evaluate(async ({ cid, text }) => {
    const res = await fetch(`/api/chat/${cid}/messages`, { credentials: 'include' });
    if (!res.ok) return { ok: false, status: res.status, body: await res.text() };
    const json = await res.json();
    const msgs = Array.isArray(json) ? json : (Array.isArray(json?.messages) ? json.messages : []);
    const count = msgs.filter(m => m.text && m.text.includes(text)).length;
    return { ok: true, count };
  }, { cid: chatId, text: 'Playwright E2E idempotent message' });
  if (!apiCheck.ok) throw new Error('API messages list failed during E2E check');
  expect(apiCheck.count).toBeGreaterThanOrEqual(1);

  // cleanup
  try { sockProc.kill(); } catch (e) {}
});

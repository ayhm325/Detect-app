import { test, expect } from '@playwright/test';
import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import net from 'net';
import prismaDefault from '../lib/prismaClient.js';
const prisma = prismaDefault.default ?? prismaDefault;

test.setTimeout(120000);

test('patient uploads file to doctor and message is persisted', async ({ page, context }) => {
  // 1) find a chat and patient user
  const chat = await prisma.chat.findFirst();
  if (!chat) throw new Error('No chat found in DB');
  const chatId = chat.id;

  const patient = await prisma.patient.findUnique({ where: { id: chat.patientId } });
  const patientUser = patient && patient.userId ? await prisma.user.findUnique({ where: { id: patient.userId } }) : null;
  if (!patientUser) throw new Error('No patient user for chat');

  // 2) generate dev token for patient
  const token = execSync(`node ${path.join('scripts','create-dev-token.mjs')} ${patientUser.email}`, { encoding: 'utf8' }).trim();

  // 3) set cookie for auth
  await context.addCookies([{ name: 'token', value: token, domain: 'localhost', path: '/' }]);

  // 4) spawn socket server for test
  const sockProc = spawn('node', [path.join('scripts','socket-server.js')], { stdio: ['ignore', 'pipe', 'pipe'] });

  // wait for TCP port 4000 to be open (max 10s)
  const port = process.env.SOCKET_PORT ? Number(process.env.SOCKET_PORT) : 4000;
  let portOpen = false;
  for (let i = 0; i < 20; i++) {
    portOpen = await new Promise((resolve) => {
      const sock = net.createConnection({ port, host: '127.0.0.1' }, () => { sock.destroy(); resolve(true); });
      sock.on('error', () => { resolve(false); });
    });
    if (portOpen) break;
    await new Promise(r => setTimeout(r, 500));
  }
  if (!portOpen) { try{ sockProc.kill(); } catch(e){}; throw new Error('Socket server did not open port ' + port); }

  // 5) create a small PNG asset for upload
  const assetDir = path.join('playwright-tests','assets');
  fs.mkdirSync(assetDir, { recursive: true });
  const assetPath = path.join(assetDir, 'pw-test-image.png');
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  fs.writeFileSync(assetPath, Buffer.from(pngBase64, 'base64'));

  // 6) open the patient chat page
  await page.goto('/ar/patient/chat');

  // wait for socket to initialize
  await page.waitForFunction(() => !!window.__app_socket && !!window.__app_socket.socket, null, { timeout: 10000 });

  // ensure file input exists (it may be hidden, so wait for attached)
  await page.waitForSelector('input[type="file"]', { state: 'attached', timeout: 10000 });

  // 7) attach file and send
  const input = await page.$('input[type="file"]');
  await input.setInputFiles(assetPath);

  // click send button (button containing svg paper-plane)
  await page.click('button:has(svg)');

  // 8) poll the DB for a message with a non-null fileUrl (some flows use socket ack, others HTTP fallback)
  const start = Date.now();
  let dbMsg = null;
  while (Date.now() - start < 20000) {
    dbMsg = await prisma.message.findFirst({ where: { chatId, fileUrl: { not: null } }, orderBy: { createdAt: 'desc' } });
    if (dbMsg) break;
    await new Promise(r => setTimeout(r, 500));
  }
  expect(dbMsg).not.toBeNull();
  expect(dbMsg.fileUrl).toBeTruthy();

  // 10) cleanup spawned socket server
  try { sockProc.kill(); } catch (e) {}
});

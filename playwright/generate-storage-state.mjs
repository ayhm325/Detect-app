import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function main() {
  // Ensure auth dir
  const outDir = path.join(process.cwd(), 'playwright', '.auth');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'patient.json');

  // Create test patient via existing helper script
  let token = null;
  try {
    const raw = execSync('node scripts/create-test-patient.mjs', { encoding: 'utf8' }).trim();
    try {
      const parsed = JSON.parse(raw);
      token = parsed.token || raw;
      console.log('create-test-patient output parsed as JSON');
    } catch (e) {
      token = raw;
      console.log('create-test-patient output is token string');
    }
  } catch (e) {
    console.error('Failed to create test patient:', e.message);
    process.exit(1);
  }

  if (!token) {
    console.error('No token obtained from create-test-patient.mjs');
    process.exit(1);
  }

  // Launch browser and inject cookie into context, then save storageState
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const cookieUrl = process.env.PW_BASE_URL || 'http://localhost:3000';
  const cookieHost = new URL(cookieUrl).hostname || 'localhost';

  await context.addCookies([
    { name: 'token', value: token, domain: cookieHost, path: '/', httpOnly: true, secure: false, sameSite: 'Lax' },
  ]);

  await context.storageState({ path: outFile });
  console.log('Saved storage state to', outFile);
  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });

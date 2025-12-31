import { test, expect } from '@playwright/test';
import prismaDefault from '../lib/prismaClient.js';
import jwt from 'jsonwebtoken';
const prisma = prismaDefault.default ?? prismaDefault;
const SECRET = process.env.JWT_SECRET || 'your-secret';

test.setTimeout(120000);
test('click add appointment button shows toast', async ({ page, baseURL, context }) => {
  // ensure a dev token for a doctor user is present so UI shows doctor actions
  const doctor = await prisma.doctor.findFirst();
  if (!doctor) throw new Error('No doctor found in DB for E2E test');
  const user = doctor.userId ? await prisma.user.findUnique({ where: { id: doctor.userId } }) : null;
  if (!user) throw new Error('Doctor has no linked user account');
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '1h' });
  const cookieUrl = baseURL || process.env.PW_BASE_URL || 'http://localhost:3000';
  const cookieHost = new URL(cookieUrl).hostname || 'localhost';
  await context.addCookies([{ name: 'token', value: token, domain: cookieHost, path: '/', httpOnly: true, secure: false, sameSite: 'Lax' }]);

  // Use 'load' instead of 'networkidle' because the app may keep long-lived connections
  await page.goto('/ar/doctor/appointments', { waitUntil: 'load', timeout: 120000 });

  // Wait for main container / UI to be ready, then ensure add button is visible
  await page.waitForSelector('main, [data-testid="appointments-list"], #root', { timeout: 60000 }).catch(() => {});
  const addButton = page.getByRole('button', { name: /إضافة موعد جديد/i });
  await expect(addButton).toBeVisible({ timeout: 15000 });
  await addButton.click({ timeout: 10000 });

  // Wait for toast container and message
  const toast = page.locator('text=ستنفتح نافذة إضافة الموعد قريبًا.').first();
  await expect(toast).toBeVisible({ timeout: 5000 });
});

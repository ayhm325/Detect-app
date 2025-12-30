import { test, expect } from '@playwright/test';
import prismaDefault from '../lib/prismaClient.js';
import jwt from 'jsonwebtoken';
const prisma = prismaDefault.default ?? prismaDefault;
const SECRET = process.env.JWT_SECRET || 'your-secret';

test('click add appointment button shows toast', async ({ page, baseURL, context }) => {
  // ensure a dev token for a doctor user is present so UI shows doctor actions
  const doctor = await prisma.doctor.findFirst();
  if (!doctor) throw new Error('No doctor found in DB for E2E test');
  const user = doctor.userId ? await prisma.user.findUnique({ where: { id: doctor.userId } }) : null;
  if (!user) throw new Error('Doctor has no linked user account');
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '1h' });
  const cookieUrl = baseURL || process.env.PW_BASE_URL || 'http://localhost';
  await context.addCookies([{ name: 'token', value: token, url: cookieUrl, path: '/' }]);

  await page.goto('/ar/doctor/appointments');

  // Click the add button (by text)
  const addButton = page.getByRole('button', { name: /إضافة موعد جديد/i });
  await expect(addButton).toBeVisible();
  await addButton.click();

  // Wait for toast container and message
  const toast = page.locator('text=ستنفتح نافذة إضافة الموعد قريبًا.').first();
  await expect(toast).toBeVisible({ timeout: 5000 });
});

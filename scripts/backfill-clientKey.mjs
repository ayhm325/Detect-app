import prisma from '../lib/prismaClient.js';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  console.log('Starting backfill for clientKey...');
  const batchSize = 200;
  let skipped = 0;
  let updated = 0;
  while (true) {
    const msgs = await prisma.message.findMany({ where: { clientKey: null }, take: batchSize });
    if (!msgs || msgs.length === 0) break;
    for (const m of msgs) {
      const key = uuidv4();
      await prisma.message.update({ where: { id: m.id }, data: { clientKey: key } });
      updated++;
    }
    console.log(`Backfilled ${updated} messages so far...`);
    if (msgs.length < batchSize) break;
  }
  console.log(`Backfill complete. Updated: ${updated}, Skipped: ${skipped}`);
}

main().catch((e) => {
  console.error('Backfill error', e);
  process.exit(1);
}).finally(() => process.exit(0));

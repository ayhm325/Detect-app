import fs from 'fs';
import path from 'path';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const MAX_FILE_SIZE = Number(process.env.MAX_UPLOAD_SIZE || 10 * 1024 * 1024); // 10MB default
const ALLOWED_EXT = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.doc', '.docx'];

function extAllowed(name) {
  const ext = (name || '').toLowerCase();
  return ALLOWED_EXT.some((e) => ext.endsWith(e));
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { chatId, key, filename, provider, bucket, region } = body || {};
    if (!chatId || !key) {
      console.error('uploads/complete: invalid params', { body });
      return new Response(JSON.stringify({ error: 'Invalid parameters', details: { chatId: !!chatId, key: !!key } }), { status: 400 });
    }

    if (provider === 's3') {
      // Validate object size using HeadObject
      const bucketToUse = bucket || process.env.S3_BUCKET;
      const regionToUse = region || process.env.AWS_REGION || 'us-east-1';
      if (!bucketToUse) return new Response(JSON.stringify({ error: 'Missing bucket config' }), { status: 500 });
      try {
        const client = new S3Client({ region: regionToUse });
        const head = await client.send(new HeadObjectCommand({ Bucket: bucketToUse, Key: key }));
        const size = head.ContentLength || 0;
        const contentType = head.ContentType || '';
        if (size > MAX_FILE_SIZE) return new Response(JSON.stringify({ error: 'file_too_large' }), { status: 400 });
        // basic content-type check
        if (!extAllowed(key) && !contentType.startsWith('image/') && !contentType.includes('pdf') && !contentType.includes('msword') && !contentType.includes('officedocument')) {
          return new Response(JSON.stringify({ error: 'invalid_file_type' }), { status: 400 });
        }
        const url = `https://${bucketToUse}.s3.${regionToUse}.amazonaws.com/${encodeURIComponent(key)}`;
        return new Response(JSON.stringify({ url, key, provider: 's3', contentType, filename: filename || key }), { status: 200 });
      } catch (e) {
        console.error('S3 head error', { bucket: bucketToUse, key, err: e });
        return new Response(JSON.stringify({ error: 's3_error', message: e?.message }), { status: 500 });
      }
    }

    const abs = path.join(process.cwd(), 'public', key);
    const stat = await fs.promises.stat(abs).catch(() => null);
    if (!stat) {
      console.error('uploads/complete: uploaded file not found', { abs, body });
      return new Response(JSON.stringify({ error: 'Uploaded file not found', path: abs }), { status: 400 });
    }
    if (stat.size > MAX_FILE_SIZE) {
      console.error('uploads/complete: file too large', { abs, size: stat.size, max: MAX_FILE_SIZE });
      return new Response(JSON.stringify({ error: 'file_too_large' }), { status: 400 });
    }
    if (!extAllowed(filename || key)) {
      console.error('uploads/complete: invalid file type', { filename, key });
      return new Response(JSON.stringify({ error: 'invalid_file_type' }), { status: 400 });
    }

    // Return a publically-accessible URL under /uploads/... (public folder is served)
    const guessedType = (() => {
      const ext = (filename || key || '').toLowerCase();
      if (ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.webp') || ext.endsWith('.gif')) return 'image/*';
      if (ext.endsWith('.pdf')) return 'application/pdf';
      if (ext.endsWith('.doc') || ext.endsWith('.docx')) return 'application/msword';
      return 'application/octet-stream';
    })();
    const url = `/${key}`;
    return new Response(JSON.stringify({ url, key, provider: 'local', contentType: guessedType, filename: filename || key }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const S3_BUCKET = process.env.S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

async function makeLocalKey(filename) {
  const safeName = filename.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
  const timestamp = Date.now();
  return `uploads/${timestamp}-${safeName}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { chatId, filename, contentType } = body || {};
    if (!chatId || !filename) return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400 });

    // If S3 is configured, return a presigned PUT URL
    if (S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      const key = `uploads/${Date.now()}-${filename.replace(/\s+/g, '_')}`;
      const client = new S3Client({ region: AWS_REGION });
      const cmd = new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, ContentType: contentType || 'application/octet-stream' });
      const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 900 });
      return new Response(JSON.stringify({ uploadUrl, key, provider: 's3', bucket: S3_BUCKET }), { status: 200 });
    }

    // Fallback to local upload flow
    const key = await makeLocalKey(filename);
    const absDir = path.join(process.cwd(), 'public', path.dirname(key));
    await fs.promises.mkdir(absDir, { recursive: true });
    const uploadUrl = `/api/uploads/local-upload?path=${encodeURIComponent(key)}`;
    return new Response(JSON.stringify({ uploadUrl, key, provider: 'local' }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

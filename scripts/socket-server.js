#!/usr/bin/env node
/**
 * Simple Socket.io server for dev — handles chat rooms and message persistence.
 * Usage (dev):
 *   NODE_ENV=development JWT_SECRET=your-secret node scripts/socket-server.js
 *
 * Notes:
 * - Verifies JWT from cookie `token` or handshake auth.token.
 * - Persists messages using prisma and emits to chat room `chat:<chatId>`.
 * - Meant as a development scaffold; in production run as a separate service behind HTTPS.
 */

import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prismaClient.js';
import { getJwtSecret } from '../lib/auth/jwtSecret.js';
import { getJwtVerifyOptions } from '../lib/auth/jwtClaims.js';

const PORT = process.env.SOCKET_PORT ? Number(process.env.SOCKET_PORT) : 4000;
const SECRET = getJwtSecret();
const DEBUG_SOCKET = process.env.DEBUG_SOCKET === '1';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
});

// Initialize Redis adapter if REDIS_URL provided
let redis = null;
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL);
    const sub = redis.duplicate();
    // Connect both clients (ioredis connects lazily, ensure connected)
    redis.connect().catch(() => {});
    sub.connect().catch(() => {});
    io.adapter(createAdapter(redis, sub));
    console.log('Socket.IO using Redis adapter');
  } catch (e) {
    console.warn('Failed to initialize Redis adapter', e.message || e);
    redis = null;
  }
}

function parseCookieString(cookie = '') {
  return cookie.split(';').map(c => c.trim()).reduce((acc, cur) => {
    const idx = cur.indexOf('=');
    if (idx > -1) acc[cur.slice(0, idx)] = decodeURIComponent(cur.slice(idx + 1));
    return acc;
  }, {});
}

io.use(async (socket, next) => {
  try {
    // Prefer token passed in handshake auth (client may send dev token)
    let token = socket.handshake.auth && socket.handshake.auth.token;
    const cookieHeader = socket.handshake.headers?.cookie;
    if (DEBUG_SOCKET) {
      console.log('[socket] auth token provided:', Boolean(token), 'cookie header present:', Boolean(cookieHeader));
    }
    if (!token) {
      // fallback: parse cookie header
      const cookies = parseCookieString(cookieHeader || '');
      token = cookies.token;
    }
    if (!token) return next(new Error('unauthenticated'));
    const user = jwt.verify(token, SECRET, getJwtVerifyOptions());
    if (DEBUG_SOCKET) console.log('[socket] auth success', { socketId: socket.id, userId: user && user.id, role: user && user.role });
    // attach minimal user info
    socket.user = { id: user.id, role: user.role, email: user.email };
    return next();
  } catch (err) {
    if (DEBUG_SOCKET) console.warn('[socket] auth failed', { socketId: socket.id, err: err && err.message });
    return next(new Error('invalid_token'));
  }
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id, 'user', socket.user && socket.user.id);

  // Debug helper: client can request its authenticated user info
  socket.on('whoami', () => {
    try {
      console.log('[Socket WhoAmI]', { socketId: socket.id, user: socket.user });
      socket.emit('me', { id: socket.user?.id, role: socket.user?.role, email: socket.user?.email });
    } catch (e) {
      console.warn('[Socket WhoAmI Error]', { socketId: socket.id, err: e && e.message });
      socket.emit('me', { error: 'no_user' });
    }
  });
  // simple presence: notify rooms when user connects
  socket.on('join', async (chatId) => {
    if (!chatId) return;
    socket.join(`chat:${chatId}`);
    console.log(`socket ${socket.id} joined chat:${chatId}`);
    // persist presence in Redis set per chat for multi-instance
    try {
      if (redis) {
        await redis.sadd(`chat:${chatId}:online`, socket.user.id);
      }
    } catch (e) { console.error('presence add error', e); }
    // broadcast presence
    socket.to(`chat:${chatId}`).emit('presence', { userId: socket.user.id, online: true });
  });

  socket.on('leave', (chatId) => {
    if (!chatId) return;
    socket.leave(`chat:${chatId}`);
    try {
      if (redis) {
        redis.srem(`chat:${chatId}:online`, socket.user.id).catch(() => {});
      }
    } catch (e) { console.error('presence rem error', e); }
    socket.to(`chat:${chatId}`).emit('presence', { userId: socket.user.id, online: false });
  });

  // typing indicator
  socket.on('typing', ({ chatId, typing }) => {
    if (!chatId) return;
    socket.to(`chat:${chatId}`).emit('typing', { userId: socket.user.id, typing });
  });

  // rate-limiting: simple per-socket window
  const RATE_WINDOW_MS = 10 * 1000; // 10s
  const RATE_MAX = 10; // max messages per window
  if (!socket.rate) socket.rate = { timestamps: [] };

  socket.on('message', async (payload, ack) => {
    // payload: { chatId, text?, fileUrl?, mimeType?, fileName?, clientKey? }
    try {
      // basic rate limiting
      const now = Date.now();
      socket.rate.timestamps = socket.rate.timestamps.filter((ts) => now - ts < RATE_WINDOW_MS);
      if (socket.rate.timestamps.length >= RATE_MAX) {
        return ack && ack({ error: 'rate_limited' });
      }
      socket.rate.timestamps.push(now);

      const { chatId, text, clientKey, fileUrl, mimeType, fileName } = payload || {};
      if (!chatId || (!(text && text.trim()) && !fileUrl)) return ack && ack({ error: 'invalid_payload' });

      // verify chat exists and user is participant
      const chat = await prisma.chat.findUnique({ where: { id: chatId } });
      if (!chat) return ack && ack({ error: 'chat_not_found' });

      const user = socket.user;
      if (user.role === 'doctor') {
        if (chat.doctorId !== user.id) return ack && ack({ error: 'forbidden' });
      } else if (user.role === 'patient') {
        const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
        if (!patient || patient.id !== chat.patientId) return ack && ack({ error: 'forbidden' });
      } else {
        return ack && ack({ error: 'forbidden' });
      }

      const sender = user.role === 'doctor' ? 'doctor' : 'patient';

      // If clientKey provided, attempt idempotent lookup first
      if (clientKey) {
        const existing = await prisma.message.findFirst({ where: { chatId, clientKey } });
        if (existing) {
          const payloadOut = { ...existing, time: existing.createdAt };
          // still emit to the room to ensure receivers have the message (safe)
          io.to(`chat:${chatId}`).emit('message', payloadOut);
          return ack && ack({ ok: true, message: payloadOut, existing: true });
        }
      }

      const message = await prisma.message.create({ data: { chatId, sender, text: text || null, clientKey, fileUrl: fileUrl || null, mimeType: mimeType || null, fileName: fileName || null } });

      // broadcast to room with ackable payload
      const payloadOut = { ...message, time: message.createdAt };
      io.to(`chat:${chatId}`).emit('message', payloadOut);

      // touch chat updatedAt
      await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });

      ack && ack({ ok: true, message: payloadOut });
    } catch (err) {
      console.error('socket message error', err);
      ack && ack({ error: 'server_error' });
    }
  });

  // delivered/read acknowledgements from clients
  // payload: { messageIds: [id,...] }
  socket.on('delivered_ack', async ({ messageIds } = {}) => {
    try {
      if (!Array.isArray(messageIds) || !messageIds.length) return;
      for (const id of messageIds) {
        try {
          const msg = await prisma.message.findUnique({ where: { id } });
          if (!msg) continue;
          // upgrade status: sent -> delivered
          if (msg.status === 'sent') {
            await prisma.message.update({ where: { id }, data: { status: 'delivered' } });
            io.to(`chat:${msg.chatId}`).emit('message_update', { id, status: 'delivered' });
          }
        } catch (e) { console.error('delivered_ack error', e); }
      }
    } catch (e) { console.error('delivered_ack handler error', e); }
  });

  socket.on('read_ack', async ({ messageIds } = {}) => {
    try {
      if (!Array.isArray(messageIds) || !messageIds.length) return;
      for (const id of messageIds) {
        try {
          const msg = await prisma.message.findUnique({ where: { id } });
          if (!msg) continue;
          // upgrade status to read
          if (msg.status !== 'read') {
            await prisma.message.update({ where: { id }, data: { status: 'read' } });
            io.to(`chat:${msg.chatId}`).emit('message_update', { id, status: 'read' });
            io.to(`chat:${msg.chatId}`).emit('message_read', { messageId: id, userId: socket.user.id, timestamp: new Date() });
          }
        } catch (e) { console.error('read_ack error', e); }
      }
    } catch (e) { console.error('read_ack handler error', e); }
  });

  socket.on('disconnect', (reason) => {
    console.log('socket disconnected', socket.id, reason);
    // On disconnect, remove the user from any chat:${chatId}:online sets they were part of
    try {
      const rooms = Array.from(socket.rooms || []);
      rooms.forEach((r) => {
        if (!r.startsWith('chat:')) return;
        const chatId = r.split(':')[1];
        if (redis) {
          redis.srem(`chat:${chatId}:online`, socket.user.id).catch(() => {});
        }
        socket.to(r).emit('presence', { userId: socket.user.id, online: false });
      });
    } catch (e) { console.error('disconnect presence cleanup failed', e); }
  });
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.warn(`Socket.io port ${PORT} already in use — skipping socket server start.`);
    // exit gracefully so developer workflow can continue (non-fatal)
    process.exit(0);
  }
  console.error('Socket server error', err);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Socket.io server listening on port ${PORT}`);
});

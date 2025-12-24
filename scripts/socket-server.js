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
import jwt from 'jsonwebtoken';
import prisma from '../lib/prismaClient.js';

const PORT = process.env.SOCKET_PORT ? Number(process.env.SOCKET_PORT) : 4000;
const SECRET = process.env.JWT_SECRET || 'your-secret-key';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
});

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
    if (!token) {
      // fallback: parse cookie header
      const cookieHeader = socket.handshake.headers?.cookie;
      const cookies = parseCookieString(cookieHeader || '');
      token = cookies.token;
    }
    if (!token) return next(new Error('unauthenticated'));
    const user = jwt.verify(token, SECRET);
    // attach minimal user info
    socket.user = { id: user.id, role: user.role, email: user.email };
    return next();
  } catch (err) {
    console.warn('socket auth failed', err.message);
    return next(new Error('invalid_token'));
  }
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id, 'user', socket.user && socket.user.id);

  // Debug helper: client can request its authenticated user info
  socket.on('whoami', () => {
    try {
      socket.emit('me', { id: socket.user?.id, role: socket.user?.role, email: socket.user?.email });
    } catch (e) {
      socket.emit('me', { error: 'no_user' });
    }
  });
  // simple presence: notify rooms when user connects
  socket.on('join', async (chatId) => {
    if (!chatId) return;
    socket.join(`chat:${chatId}`);
    console.log(`socket ${socket.id} joined chat:${chatId}`);
    // broadcast presence
    socket.to(`chat:${chatId}`).emit('presence', { userId: socket.user.id, online: true });
  });

  socket.on('leave', (chatId) => {
    if (!chatId) return;
    socket.leave(`chat:${chatId}`);
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
    // payload: { chatId, text }
    try {
      // basic rate limiting
      const now = Date.now();
      socket.rate.timestamps = socket.rate.timestamps.filter((ts) => now - ts < RATE_WINDOW_MS);
      if (socket.rate.timestamps.length >= RATE_MAX) {
        return ack && ack({ error: 'rate_limited' });
      }
      socket.rate.timestamps.push(now);

      const { chatId, text } = payload || {};
      if (!chatId || !text || !text.trim()) return ack && ack({ error: 'invalid_payload' });

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
      const message = await prisma.message.create({ data: { chatId, sender, text } });

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

  socket.on('disconnect', (reason) => {
    console.log('socket disconnected', socket.id, reason);
  });
});

server.listen(PORT, () => {
  console.log(`Socket.io server listening on port ${PORT}`);
});

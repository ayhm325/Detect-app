"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// Client hook to connect to Socket.io server.
// Usage:
// const { connect, sendMessage, onMessage, connected } = useSocket();

export default function useSocket({ url } = {}) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback((opts = {}) => {
    if (socketRef.current) return socketRef.current;
    // Try to read a dev token injected by login (tokenForDev) if present
    const devToken = typeof window !== 'undefined' ? window.__DEV_TOKEN : undefined;
    const auth = opts.token || devToken ? { token: opts.token || devToken } : undefined;

    // Default to local dev socket server when developing or when a dev token exists
    const defaultUrl = (typeof window !== 'undefined' && (devToken || process.env.NODE_ENV === 'development'))
      ? 'http://localhost:4000'
      : (typeof window !== 'undefined' ? window.location.origin : '');

    const socket = io(url || defaultUrl, {
      auth,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socketRef.current = socket;
    return socket;
  }, [url]);

  const disconnect = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.disconnect();
    socketRef.current = null;
  }, []);

  const join = useCallback((chatId) => {
    if (!socketRef.current) return;
    socketRef.current.emit('join', chatId);
  }, []);

  const leave = useCallback((chatId) => {
    if (!socketRef.current) return;
    socketRef.current.emit('leave', chatId);
  }, []);

  const sendMessage = useCallback((payload, cb) => {
    if (!socketRef.current) return cb && cb({ error: 'not_connected' });
    socketRef.current.emit('message', payload, cb);
  }, []);

  const sendTyping = useCallback((chatId, typing = true) => {
    if (!socketRef.current) return;
    socketRef.current.emit('typing', { chatId, typing });
  }, []);

  const onTyping = useCallback((handler) => {
    if (!socketRef.current) return;
    socketRef.current.on('typing', handler);
    return () => socketRef.current.off('typing', handler);
  }, []);

  const onPresence = useCallback((handler) => {
    if (!socketRef.current) return;
    socketRef.current.on('presence', handler);
    return () => socketRef.current.off('presence', handler);
  }, []);

  const onMessage = useCallback((handler) => {
    if (!socketRef.current) return;
    socketRef.current.on('message', handler);
    return () => socketRef.current.off('message', handler);
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.off();
        socketRef.current.disconnect();
      }
    };
  }, []);

  return { connect, disconnect, join, leave, sendMessage, sendTyping, onMessage, onTyping, onPresence, connected };
}

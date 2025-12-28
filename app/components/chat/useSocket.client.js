"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';

// Client hook to connect to Socket.io server.
// Usage:
// const { connect, sendMessage, onMessage, connected } = useSocket();

export default function useSocket({ url } = {}) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  // Create or reuse a global, reference-counted socket instance to avoid
  // multiple connections during HMR or when multiple components mount.
  const connect = useCallback((opts = {}) => {
    if (socketRef.current) {
      return socketRef.current;
    }

    const devToken = typeof window !== 'undefined' ? window.__DEV_TOKEN : undefined;
    const auth = opts.token || devToken ? { token: opts.token || devToken } : undefined;
    const defaultUrl = (typeof window !== 'undefined' && (devToken || process.env.NODE_ENV === 'development'))
      ? 'http://localhost:4000'
      : (typeof window !== 'undefined' ? window.location.origin : '');

    const socketKey = url || defaultUrl;

    // reuse global socket if present and for same URL
    if (globalThis.__app_socket && globalThis.__app_socket.url === socketKey) {
      globalThis.__app_socket_refcount = (globalThis.__app_socket_refcount || 0) + 1;
      socketRef.current = globalThis.__app_socket.socket;
      // attach per-hook listeners for connect/disconnect but keep references
      const existing = socketRef.current;
      const onConnect = () => setConnected(true);
      const onDisconnect = () => setConnected(false);
      existing.on('connect', onConnect);
      existing.on('disconnect', onDisconnect);
      // store a per-hook cleanup so we only remove the handlers added by this hook
      socketRef.current._myCleanup = () => {
        try {
          existing.off('connect', onConnect);
          existing.off('disconnect', onDisconnect);
        } catch (e) {}
      };
      return socketRef.current;
    }

    // create new socket but do not autoConnect to control when we connect
    const socket = io(socketKey, {
      auth,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 2000,
    });

    // store globally
    globalThis.__app_socket = { socket, url: socketKey };
    globalThis.__app_socket_refcount = (globalThis.__app_socket_refcount || 0) + 1;

    // set up per-hook listeners and save cleanup
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket._myCleanup = () => {
      try {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
      } catch (e) {}
    };

    // initiate connection
    try {
      socket.connect();
    } catch (e) {
      // ignore connect errors; connect will retry according to socket.io settings
    }

    socketRef.current = socket;
    return socket;
  }, [url]);

  const disconnect = useCallback(() => {
    const sock = socketRef.current;
    if (!sock) return;
    // run per-hook cleanup (remove handlers added by this hook)
    try { if (sock._myCleanup) { sock._myCleanup(); sock._myCleanup = null; } } catch (e) {}
    // decrement global refcount and only disconnect when no more consumers
    globalThis.__app_socket_refcount = Math.max((globalThis.__app_socket_refcount || 1) - 1, 0);
    if (globalThis.__app_socket_refcount === 0) {
      try { sock.disconnect(); } catch (e) {}
      delete globalThis.__app_socket;
      delete globalThis.__app_socket_refcount;
    }
    socketRef.current = null;
  }, []);

  const join = useCallback((chatId) => {
    const sock = socketRef.current || (globalThis.__app_socket && globalThis.__app_socket.socket);
    if (!sock) return;
    // ensure we don't spam repeated join emits for same room
    globalThis.__app_socket_joinedRooms = globalThis.__app_socket_joinedRooms || new Map();
    const joined = globalThis.__app_socket_joinedRooms.get(sock.id) || new Set();
    // avoid mutating socket object (ESLint immutability rule)
    globalThis.__app_socket_lastJoinTs = globalThis.__app_socket_lastJoinTs || new Map();
    const lastObj = globalThis.__app_socket_lastJoinTs.get(sock.id) || {};
    const now = Date.now();
    if (joined.has(chatId)) {
      // throttle duplicate joins: ignore if last join was within 1000ms
      if (lastObj[chatId] && now - lastObj[chatId] < 1000) return;
    }
    try {
      sock.emit('join', chatId);
      joined.add(chatId);
      lastObj[chatId] = now;
      globalThis.__app_socket_lastJoinTs.set(sock.id, lastObj);
      globalThis.__app_socket_joinedRooms.set(sock.id, joined);
    } catch (e) {}
  }, []);

  const leave = useCallback((chatId) => {
    const sock = socketRef.current || (globalThis.__app_socket && globalThis.__app_socket.socket);
    if (!sock) return;
    try {
      sock.emit('leave', chatId);
      const joined = globalThis.__app_socket_joinedRooms && globalThis.__app_socket_joinedRooms.get(sock.id);
      if (joined) joined.delete(chatId);
    } catch (e) {}
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
    const sock = socketRef.current || (globalThis.__app_socket && globalThis.__app_socket.socket);
    if (!sock) return;
    sock.on('typing', handler);
    return () => { try { sock.off('typing', handler); } catch (e) {} };
  }, []);

  const onPresence = useCallback((handler) => {
    const sock = socketRef.current || (globalThis.__app_socket && globalThis.__app_socket.socket);
    if (!sock) return;
    sock.on('presence', handler);
    return () => { try { sock.off('presence', handler); } catch (e) {} };
  }, []);

  const onMessage = useCallback((handler) => {
    const sock = socketRef.current || (globalThis.__app_socket && globalThis.__app_socket.socket);
    if (!sock) return;
    sock.on('message', handler);
    return () => { try { sock.off('message', handler); } catch (e) {} };
  }, []);

  useEffect(() => {
    return () => {
      // remove per-hook listeners and decrease global refcount
      try { if (socketRef.current && socketRef.current._myCleanup) { socketRef.current._myCleanup(); socketRef.current._myCleanup = null; } } catch(e) {}
      disconnect();
    };
  }, [disconnect]);

  // Memoize returned API so its identity is stable across renders.
  const api = useMemo(() => ({
    connect,
    disconnect,
    join,
    leave,
    sendMessage,
    sendTyping,
    onMessage,
    onTyping,
    onPresence,
    connected,
  }), [connect, disconnect, join, leave, sendMessage, sendTyping, onMessage, onTyping, onPresence, connected]);

  return api;
}

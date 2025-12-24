Socket.io dev server (scaffold)
================================

Overview
--------
This repository includes a small development Socket.io server scaffold at `scripts/socket-server.js`.
It is intended as a starting point for real-time chat using Socket.io + Prisma + JWT auth.

Run (development)
-----------------
1. Install dependencies (if you don't have socket.io and express yet):

```bash
npm install socket.io express socket.io-client
```

2. Start the Socket.io server:

```bash
NODE_ENV=development JWT_SECRET=your-secret node scripts/socket-server.js
```

3. The server listens on `PORT` from env `SOCKET_PORT` (default `4000`).

Client usage
------------
- A React client hook was added at `app/components/chat/useSocket.client.js`.
- In development you can use the login response field `tokenForDev` to pass a token to the client for the Socket.io handshake (dev-only). For example after login:

```js
// after successful login (dev only)
window.__DEV_TOKEN = data.tokenForDev;

// then in a component
const socket = useSocket();
const s = socket.connect();
socket.join(chatId);
socket.onMessage(msg => console.log(msg));
socket.sendMessage({ chatId, text }, (res) => console.log(res));
```

Security notes
--------------
- This scaffold supports reading the JWT from the `token` cookie (HttpOnly) on the server side, or from `handshake.auth.token` if provided by the client — the latter is intended for development only.
- Do NOT store your production JWT in localStorage. Use HttpOnly cookies in production.
- For production WebSocket deployments ensure the service runs under HTTPS and uses `SameSite`/`Secure` cookie settings compatible with your domain setup.

Next steps
----------
1. Decide deployment model: separate Socket.io service vs. integrated server.
2. Add robust presence management (online/offline), typing indicators, and acknowledgement handling.
3. Add authorization checks and rate-limiting for sockets.
4. Integrate into UI and replace polling with socket events.

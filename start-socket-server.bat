@echo off
set NODE_ENV=production
set SOCKET_PORT=4000
set JWT_SECRET=your-secret
node scripts/socket-server.js

@echo off
set NODE_ENV=production
set SOCKET_PORT=4000
:: JWT_SECRET intentionally not overridden here so the shared .env value is used.
node scripts/socket-server.js

# Development scripts

This folder contains developer helper scripts used for local testing, debugging and E2E socket checks.

Important: these scripts are intended for development only. Never expose development tokens or run these against production databases.

## Requirements

- Node.js (>=16)
- `DATABASE_URL` environment variable pointing to your dev Postgres
- `JWT_SECRET` (must match the app and the socket server when testing sockets)
- Run `npm install` to ensure dependencies (Prisma client, socket.io-client for tests) are installed
- Prisma migrations applied for the schema used by the scripts

## Scripts

- `create-dev-token.mjs <email>`
  - Description: generate a short-lived JWT for the given user email (development convenience).
  - Usage:
    ```bash
    JWT_SECRET='your-secret' node scripts/create-dev-token.mjs adham@yahoo.com
    ```
  - Notes: token is signed with `JWT_SECRET` and can be used with the socket dev server or in `window.__DEV_TOKEN` in the browser.

- `list-chats.mjs`
  - Description: prints up to 20 recent chat IDs from the database.
  - Usage:
    ```bash
    node scripts/list-chats.mjs
    ```

- `show-chat.mjs <chatId>`
  - Description: show full chat row (doctor, patient) for a given chat id.
  - Usage:
    ```bash
    node scripts/show-chat.mjs <chatId>
    ```

- `show-messages.mjs <chatId>`
  - Description: lists messages for a chat (ordered ascending).
  - Usage:
    ```bash
    node scripts/show-messages.mjs <chatId>
    ```

- `insert-message.mjs <chatId> <doctor|patient> [text]`
  - Description: insert a message directly into the DB (sender enum is `doctor` or `patient`).
  - Usage:
    ```bash
    node scripts/insert-message.mjs <chatId> doctor "Hello from test"
    ```
  - Notes: useful to simulate persisted messages without going through sockets.

- `e2e-socket-test.mjs <chatId> <doctorEmail> <patientEmail> [senderRole]
  - Description: automated E2E test that launches two Node socket clients (doctor & patient), joins the given chat, sends a message from the chosen sender (default: doctor), waits for ack and the receiver's event, and verifies DB persistence.
  - Usage:
    ```bash
    JWT_SECRET='your-secret' node scripts/e2e-socket-test.mjs <chatId> ajad@yahoo.com ko@gmail.com
    # to test patient -> doctor
    JWT_SECRET='your-secret' node scripts/e2e-socket-test.mjs <chatId> ajad@yahoo.com ko@gmail.com patient
    ```
  - Notes: requires `JWT_SECRET` to match the secret used by the dev socket server.

- `socket-server.js`
  - Description: a lightweight development Socket.io server file used locally to test real-time flows. It validates JWTs and persists messages via Prisma.
  - Usage:
    ```bash
    JWT_SECRET='your-secret' node scripts/socket-server.js
    ```

- Utility scripts:
  - `print-doctors-with-user.js` — prints doctors joined with their `user` rows (helpful to locate user emails).
  - `query-user.js <email>` — prints a `user` row for the given email.

## Environment notes & safety

- `JWT_SECRET` is used to sign and verify JWT tokens. Use the same secret for the Next.js app and the socket dev server during local testing to avoid `invalid_token` errors.
- `window.__DEV_TOKEN` is an easy way (for local dev) to inject a JWT into the browser for socket connection testing. Only use in development.
- These scripts operate directly on your dev database — be careful when running `insert-message.mjs` or other write operations.

## Example workflow for a socket test

1. Create a dev token for the doctor:
   ```bash
   node scripts/create-dev-token.mjs ajad@yahoo.com
   ```
2. Start the socket dev server:
   ```bash
   JWT_SECRET='your-secret' node scripts/socket-server.js
   ```
3. Run the automated E2E script:
   ```bash
   JWT_SECRET='your-secret' node scripts/e2e-socket-test.mjs <chatId> ajad@yahoo.com ko@gmail.com
   ```

## Troubleshooting

- `connect_error: invalid_token` — confirm `JWT_SECRET` used to sign the token matches the socket server's `JWT_SECRET`.
- `ack { error: 'forbidden' }` — means the connected user is not a participant of the chat; run `node scripts/show-chat.mjs <chatId>` and confirm the `doctorId` / `patient.userId`.
- Live-reload websocket errors (e.g. `ws://127.0.0.1:5500//ws`) are unrelated to Next.js; they come from external live-reload tooling.

---

If you want, I can add a small `scripts/README.md` section to your main README or create GitHub Actions to run `e2e-socket-test.mjs` in CI using a test DB container.

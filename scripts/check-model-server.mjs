// scripts/check-model-server.mjs
// Verifies the Python model server is reachable before running E2E.
// - Default model predict URL: http://127.0.0.1:8000/predict
// - Health endpoint:           http://127.0.0.1:8000/health
//
// Config via env:
// - PY_MODEL_URL: model predict URL (used by the app)
// - MODEL_HEALTH_URL: override health URL directly
// - MODEL_HEALTH_TIMEOUT_MS: total timeout (default 30000)

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function toHealthUrl() {
  const override = process.env.MODEL_HEALTH_URL;
  if (override) return override;

  const predict = process.env.PY_MODEL_URL || 'http://127.0.0.1:8000/predict';
  try {
    const u = new URL(predict);
    // If someone passed /predict, swap to /health.
    if (u.pathname.endsWith('/predict')) u.pathname = u.pathname.replace(/\/predict$/, '/health');
    else if (u.pathname === '/' || !u.pathname) u.pathname = '/health';
    else u.pathname = u.pathname.replace(/\/+$/, '') + '/health';
    u.search = '';
    u.hash = '';
    return u.toString();
  } catch {
    // fallback
    return 'http://127.0.0.1:8000/health';
  }
}

async function main() {
  const healthUrl = toHealthUrl();
  const totalTimeout = Number(process.env.MODEL_HEALTH_TIMEOUT_MS || 30_000);
  const start = Date.now();

  // Retry with gentle backoff.
  let attempt = 0;
  while (Date.now() - start < totalTimeout) {
    attempt += 1;
    try {
      const res = await fetch(healthUrl, { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      // Many servers return JSON; we don't strictly require it.
      if (text && text.toLowerCase().includes('ok')) {
        process.stdout.write(`[model-check] OK: ${healthUrl}\n`);
        return;
      }
      // If response isn't clearly 'ok', still accept a 200.
      process.stdout.write(`[model-check] OK (200): ${healthUrl}\n`);
      return;
    } catch (e) {
      const elapsed = Date.now() - start;
      if (elapsed + 250 >= totalTimeout) break;
      const delay = Math.min(1500, 250 + attempt * 150);
      process.stdout.write(`[model-check] waiting for model server... (${attempt}) ${String(e?.message || e)}\n`);
      await sleep(delay);
    }
  }

  process.stderr.write(`\n[model-check] ERROR: model server not ready.\n`);
  process.stderr.write(`[model-check] Tried: ${healthUrl}\n`);
  process.stderr.write(`[model-check] Hint: start it with: npm run dev (includes dev:model)\n`);
  process.stderr.write(`[model-check] Or manually: python_model\\venv\\Scripts\\python.exe python_model\\predict_server.py\n\n`);
  process.exit(1);
}

main();

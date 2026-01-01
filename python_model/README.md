Benchmarking the model server
=============================

This folder includes `benchmark.py` — a lightweight script to measure latency and throughput of the `/predict` endpoint exposed by `python_model/predict_server.py`.

Features
- Latency measurements with warm-up skip
- Percentiles (p50, p90, p99)
- Optional concurrency (parallel requests) for throughput testing
- Optional CSV output for record-keeping

Quick examples
- Run 30 sequential requests (3 warmup) without heatmap:

```powershell
python python_model/benchmark.py --url http://127.0.0.1:8000/predict --iters 30 --warmup 3
```

- Run 30 requests asking for Grad-CAM heatmaps (slower):

```powershell
python python_model/benchmark.py --url http://127.0.0.1:8000/predict --iters 30 --warmup 3 --with-heatmap
```

- Run 100 requests with concurrency=8 and save CSV:

```powershell
python python_model/benchmark.py --url http://127.0.0.1:8000/predict --iters 100 --warmup 5 --concurrency 8 --csv results.csv
```

Notes
- Warm-up runs are executed sequentially before the main test (they are not recorded in statistics).
- When using `--concurrency`, the script will dispatch `--iters` requests and collect results as they complete.
- CSV columns: `timestamp, run_idx, time_ms, status, error`.

Suggested next steps
- Run tests with a real X-ray image (`--image`) for representative numbers.
- Try different `OMP_NUM_THREADS` / `MKL_NUM_THREADS` values to find best CPU settings for your environment.
- Use CSV outputs to plot p50/p90/p99 trends across configurations.
# Model prediction server

This folder contains a FastAPI server to serve the trained DenseNet model.

Quick start

1. Activate the Python virtualenv in `python_model/venv`.

Windows (PowerShell):

```powershell
.
python_model\venv\Scripts\Activate.ps1
python -m pip install -r ..\requirements.txt fastapi uvicorn pydantic
python predict_server.py
```

2. The server listens on `http://0.0.0.0:8000` by default.

- Health: `GET /health`
- Predict: `POST /predict` with JSON body `{ "image_base64": "..." }` where value is base64-encoded image bytes.

3. In the Next.js app the proxy API is available at `/api/predict` and forwards to the Python server. Set environment variable `PY_MODEL_URL` to change the Python server address.

Example client payload (JavaScript):

```js
const b64 = await toBase64(file);
const res = await fetch('/api/predict', { method: 'POST', body: JSON.stringify({ image_base64: b64 }), headers: {'Content-Type':'application/json'} });
const json = await res.json();
```

Exporting TorchScript (optional, recommended for production):

1. Ensure the trained model `best_densenet169_xray.pth` is in this folder.
2. Run:

```powershell
python export_torchscript.py
```

This creates `best_densenet169_xray_scripted.pt`. The server will automatically load it (if present) and use it for faster inference when `with_heatmap` is false.


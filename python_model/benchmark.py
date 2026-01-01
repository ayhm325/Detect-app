#!/usr/bin/env python3
"""Simple benchmark for the /predict endpoint.

Usage examples:
  python benchmark.py --url http://127.0.0.1:8000/predict --iters 12 --warmup 2 --with-heatmap false

The script posts a tiny test image (or a file passed with --image) and reports latency statistics.
"""
import time
import requests
import base64
import argparse
import statistics
import numpy as np
import csv
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys

# 1x1 PNG base64 used as a tiny test image (valid PNG)
TEST_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
)


def load_image_b64(path):
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode('ascii')


def run_once(url, image_b64, with_heatmap=False, timeout=30.0):
    payload = {"image_base64": image_b64, "with_heatmap": bool(with_heatmap)}
    t0 = time.time()
    try:
        r = requests.post(url, json=payload, timeout=timeout)
        dt = time.time() - t0
        return dt, r.status_code, r.text
    except Exception as e:
        return None, None, str(e)


def main():
    p = argparse.ArgumentParser(description="Benchmark /predict endpoint")
    p.add_argument('--url', required=True, help='Full /predict URL, e.g. http://127.0.0.1:8000/predict')
    p.add_argument('--image', help='Path to image file to use (optional)')
    p.add_argument('--iters', type=int, default=12, help='Total iterations (including warmup)')
    p.add_argument('--warmup', type=int, default=2, help='Number of warm-up requests to skip')
    p.add_argument('--with-heatmap', action='store_true', help='Request heatmap (slower)')
    p.add_argument('--timeout', type=float, default=30.0, help='Request timeout in seconds')
    p.add_argument('--concurrency', type=int, default=1, help='Run concurrent requests (throughput). If >1 the script will run `--iters` requests concurrently using this many workers')
    p.add_argument('--csv', help='Optional CSV output path to record each request as timestamp,run_idx,time_ms,status,error')
    args = p.parse_args()

    if args.image:
        try:
            image_b64 = load_image_b64(args.image)
        except Exception as e:
            print('Failed to read image:', e, file=sys.stderr)
            sys.exit(2)
    else:
        image_b64 = TEST_B64

    total = args.iters
    warmup = args.warmup
    if warmup >= total:
        print('warmup must be smaller than iters', file=sys.stderr)
        sys.exit(2)

    print(f'Benchmarking {args.url} | iters={total} warmup={warmup} with_heatmap={args.with_heatmap} concurrency={args.concurrency} csv={args.csv}')
    times = []
    failures = 0

    # perform warmup sequentially
    for i in range(warmup):
        dt, status, body = run_once(args.url, image_b64, with_heatmap=args.with_heatmap, timeout=args.timeout)
        tag = 'WARMUP'
        if dt is None:
            print(f'[{i+1}/{warmup}] {tag} ERROR: {body}')
        else:
            print(f'[{i+1}/{warmup}] {tag} status={status} time={dt*1000:.1f}ms')

    # open CSV if requested
    csv_file = None
    csv_writer = None
    if args.csv:
        csv_file = open(args.csv, 'w', newline='', encoding='utf-8')
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(['timestamp', 'run_idx', 'time_ms', 'status', 'error'])

    def run_parallel(url, image_b64, total, concurrency, with_heatmap=False, timeout=30.0, csv_writer=None):
        results = []
        with ThreadPoolExecutor(max_workers=concurrency) as ex:
            futures = [ex.submit(run_once, url, image_b64, with_heatmap, timeout) for _ in range(total)]
            for i, fut in enumerate(as_completed(futures), start=1):
                dt, status, body = fut.result()
                idx = i
                if dt is None:
                    results.append((idx, None, None, body))
                    if csv_writer:
                        csv_writer.writerow([time.time(), idx, '', '', body])
                else:
                    results.append((idx, dt, status, body))
                    if csv_writer:
                        csv_writer.writerow([time.time(), idx, f'{dt*1000:.3f}', status, ''])
        times = [r[1] for r in results if r[1] is not None]
        failures = len([r for r in results if r[1] is None])
        return times, failures

    # run main loop: support concurrency > 1
    if args.concurrency and args.concurrency > 1:
        print(f'Running {total} requests with concurrency={args.concurrency}')
        times_list, failures_par = run_parallel(args.url, image_b64, total, args.concurrency, with_heatmap=args.with_heatmap, timeout=args.timeout, csv_writer=csv_writer)
        failures += failures_par
        times.extend(times_list)
        print(f'Completed {total} concurrent requests (failures={failures_par})')
    else:
        for i in range(total):
            dt, status, body = run_once(args.url, image_b64, with_heatmap=args.with_heatmap, timeout=args.timeout)
            if dt is None:
                failures += 1
                print(f'[{i+1}/{total}] ERROR: {body}')
                if csv_writer:
                    csv_writer.writerow([time.time(), i+1, '', '', body])
                continue

            tag = 'RUN'
            print(f'[{i+1}/{total}] {tag} status={status} time={dt*1000:.1f}ms')
            times.append(dt)
            if csv_writer:
                csv_writer.writerow([time.time(), i+1, f'{dt*1000:.3f}', status, ''])

    if csv_file:
        csv_file.close()

    if times:
        times_ms = [t * 1000.0 for t in times]
        print('\nResults (excluding warmup):')
        print(f'  runs: {len(times)}  failures: {failures}')
        print(f'  avg: {statistics.mean(times_ms):.1f} ms')
        print(f'  median: {statistics.median(times_ms):.1f} ms')
        print(f'  min: {min(times_ms):.1f} ms')
        print(f'  max: {max(times_ms):.1f} ms')
        if len(times_ms) > 1:
            print(f'  stdev: {statistics.pstdev(times_ms):.1f} ms')
        # percentiles p50/p90/p99
        try:
            p50, p90, p99 = np.percentile(times_ms, [50, 90, 99])
            print(f'  p50: {p50:.1f} ms  p90: {p90:.1f} ms  p99: {p99:.1f} ms')
        except Exception:
            pass
    else:
        print('\nNo successful runs recorded.')


if __name__ == '__main__':
    main()

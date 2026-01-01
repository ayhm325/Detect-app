#!/usr/bin/env python3
"""Analyze benchmark CSVs and generate summary + plots.

Usage: python analyze_benchmarks.py --csv-pattern "python_model/results_*.csv" --outdir python_model/bench_reports
"""
import argparse
import glob
import os
import csv
import numpy as np
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    HAS_MPL = True
except Exception:
    HAS_MPL = False
from datetime import datetime


def summarize_series(times_ms):
    arr = np.array(times_ms)
    return {
        'count': int(len(arr)),
        'mean_ms': float(np.mean(arr)) if len(arr) else None,
        'median_ms': float(np.median(arr)) if len(arr) else None,
        'min_ms': float(np.min(arr)) if len(arr) else None,
        'max_ms': float(np.max(arr)) if len(arr) else None,
        'p50_ms': float(np.percentile(arr, 50)) if len(arr) else None,
        'p90_ms': float(np.percentile(arr, 90)) if len(arr) else None,
        'p99_ms': float(np.percentile(arr, 99)) if len(arr) else None,
        'stdev_ms': float(np.std(arr, ddof=0)) if len(arr) else None,
    }


def plot_hist(times_ms, label, outpath):
    if not HAS_MPL:
        return False
    plt.figure(figsize=(6,4))
    plt.hist(times_ms, bins=40, color='#2b8cbe', edgecolor='k', alpha=0.8)
    plt.title(f'Latency distribution: {label}')
    plt.xlabel('ms')
    plt.ylabel('count')
    plt.grid(alpha=0.2)
    plt.tight_layout()
    plt.savefig(outpath)
    plt.close()
    print(f'Saved plot: {outpath}')
    return True


def main():
    print('HAS_MPL =', HAS_MPL)
    p = argparse.ArgumentParser()
    p.add_argument('--csv-pattern', default='python_model/results_*.csv')
    p.add_argument('--outdir', default='python_model/bench_reports')
    args = p.parse_args()

    files = sorted(glob.glob(args.csv_pattern))
    if not files:
        print('No CSV files found with pattern', args.csv_pattern)
        return 1

    os.makedirs(args.outdir, exist_ok=True)
    report_lines = []
    summary = {}

    for f in files:
        name = os.path.basename(f)
        label = name.replace('results_', '').replace('.csv','')
        # read CSV without pandas (compatibility)
        rows = []
        with open(f, 'r', encoding='utf-8') as fh:
            reader = csv.DictReader(fh)
            for r in reader:
                rows.append(r)
        times = []
        failures = 0
        for r in rows:
            tm = r.get('time_ms', '')
            err = r.get('error', '') if 'error' in r else ''
            if tm is None or tm == '' or str(tm).strip() == '':
                # count as failure when no time recorded
                if err and str(err).strip() != '':
                    failures += 1
                else:
                    failures += 1
                continue
            try:
                times.append(float(tm))
            except Exception:
                # skip unparsable
                failures += 1
                continue

        print(f'Processing {name}: {len(times)} successful runs, failures={failures}')
        stats = summarize_series(times)
        stats['failures'] = int(failures)
        summary[label] = stats

        # write per-file summary
        report_lines.append(f'## {label}\n')
        for k,v in stats.items():
            report_lines.append(f'- **{k}**: {v}')
        report_lines.append('\n')

        # plot histogram (if available)
        if len(times) > 0:
            outpng = os.path.join(args.outdir, f'{label}_hist.png')
            ok = plot_hist(times, label, outpng)
            if ok:
                report_lines.append(f'![{label}]({outpng})\n')
            else:
                report_lines.append(f'- Plot skipped (matplotlib not installed) for {label}\n')

    # combined plot overlay (if plotting available)
    combined_png = None
    if HAS_MPL:
        plt.figure(figsize=(8,4))
        for label, stats in summary.items():
            # find the file matching this label
            fpath = None
            for x in files:
                if label in os.path.basename(x):
                    fpath = x
                    break
            if not fpath:
                continue
            # read times from csv
            rows = []
            with open(fpath, 'r', encoding='utf-8') as fh:
                reader = csv.DictReader(fh)
                for r in reader:
                    rows.append(r)
            times = []
            for r in rows:
                tm = r.get('time_ms', '')
                if tm is None or str(tm).strip() == '':
                    continue
                try:
                    times.append(float(tm))
                except Exception:
                    continue
            if len(times) == 0:
                continue
            plt.hist(times, bins=80, alpha=0.4, label=label)
        plt.xlabel('ms')
        plt.ylabel('count')
        plt.title('Latency distributions (overlay)')
        plt.legend()
        plt.tight_layout()
        combined_png = os.path.join(args.outdir, 'combined_hist.png')
        plt.savefig(combined_png)
        plt.close()
        print(f'Saved plot: {combined_png}')
        report_lines.append(f'## Combined distributions\n![combined]({combined_png})\n')
    else:
        report_lines.append('## Combined distributions\n')
        report_lines.append('\n')

    # write markdown report
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    header = [f'# Benchmark report', f'Generated: {ts}', '']
    md = '\n'.join(header + report_lines)
    md_path = os.path.join(args.outdir, 'bench_report.md')
    with open(md_path, 'w', encoding='utf-8') as fh:
        fh.write(md)

    print('Wrote report to', md_path)
    print('Saved plots to', args.outdir)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

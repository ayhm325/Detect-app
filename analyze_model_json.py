"""
analyze_model_json.py

Reads `model_demo_info.json`, computes statistics and generates plots:
- params histogram (log scale)
- top-N layers by params
- trainable vs non-trainable pie
- params aggregated by layer type

Outputs saved under `reports/`.
"""
import json
import os
from collections import defaultdict

import matplotlib.pyplot as plt
import numpy as np


def ensure_reports_dir():
    out_dir = os.path.join(os.getcwd(), "reports")
    os.makedirs(out_dir, exist_ok=True)
    return out_dir


def load_json(path="model_demo_info.json"):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def analyze(info):
    layers = info.get("layers", [])

    # collect per-layer params
    names = []
    params = []
    trainable = []
    types = []
    for L in layers:
        names.append(L.get("name"))
        params.append(int(L.get("params", 0)))
        trainable.append(int(L.get("trainable_params", 0)))
        types.append(L.get("type", "Unknown"))

    params = np.array(params)
    trainable = np.array(trainable)

    total = int(info.get("total_parameters", int(params.sum())))
    trainable_total = int(info.get("trainable_parameters", int(trainable.sum())))

    stats = {
        "total_parameters": total,
        "trainable_parameters": trainable_total,
        "num_layers": len(layers),
    }

    out_dir = ensure_reports_dir()

    # Histogram of per-layer params (log bins)
    nonzero = params[params > 0]
    if nonzero.size > 0:
        plt.figure(figsize=(6, 4))
        bins = np.logspace(np.log10(nonzero.min()), np.log10(nonzero.max()), 30)
        plt.hist(nonzero, bins=bins)
        plt.xscale('log')
        plt.xlabel('Parameters per layer (log scale)')
        plt.ylabel('Count')
        plt.title('Histogram of layer parameter counts')
        p1 = os.path.join(out_dir, 'params_histogram.png')
        plt.tight_layout()
        plt.savefig(p1, dpi=150)
        plt.close()
        stats['params_histogram'] = os.path.relpath(p1)

    # Top N layers by params
    N = 20
    idx = np.argsort(-params)
    top_idx = idx[:N]
    top_names = [names[i] for i in top_idx]
    top_params = params[top_idx]
    plt.figure(figsize=(8, max(4, 0.25 * len(top_names))))
    y_pos = np.arange(len(top_names))
    plt.barh(y_pos, top_params[::-1])
    plt.yticks(y_pos, [n for n in top_names[::-1]])
    plt.xlabel('Parameters')
    plt.title(f'Top {len(top_names)} layers by parameter count')
    p2 = os.path.join(out_dir, 'top_layers.png')
    plt.tight_layout()
    plt.savefig(p2, dpi=150)
    plt.close()
    stats['top_layers_image'] = os.path.relpath(p2)

    # Trainable vs non-trainable pie
    non_trainable = total - trainable_total
    labels = ['trainable', 'non-trainable']
    sizes = [trainable_total, non_trainable]
    plt.figure(figsize=(4, 4))
    plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90)
    plt.title('Trainable vs Non-trainable parameters')
    p3 = os.path.join(out_dir, 'trainable_pie.png')
    plt.tight_layout()
    plt.savefig(p3, dpi=150)
    plt.close()
    stats['trainable_pie'] = os.path.relpath(p3)

    # Params by layer type
    agg = defaultdict(int)
    for t, prm in zip(types, params):
        agg[t] += int(prm)

    # sort and plot top types
    items = sorted(agg.items(), key=lambda x: -x[1])
    types_sorted = [x[0] for x in items]
    vals_sorted = [x[1] for x in items]
    plt.figure(figsize=(8, max(3, 0.3 * len(types_sorted))))
    y_pos = np.arange(len(types_sorted))
    plt.barh(y_pos, vals_sorted[::-1])
    plt.yticks(y_pos, types_sorted[::-1])
    plt.xlabel('Total parameters')
    plt.title('Parameters aggregated by layer type')
    p4 = os.path.join(out_dir, 'params_by_type.png')
    plt.tight_layout()
    plt.savefig(p4, dpi=150)
    plt.close()
    stats['params_by_type_image'] = os.path.relpath(p4)

    # Save a small JSON summary including top layers
    top_list = []
    for i in top_idx:
        top_list.append({
            'name': names[i],
            'type': types[i],
            'params': int(params[i]),
            'trainable_params': int(trainable[i])
        })
    stats['top_layers'] = top_list

    summary_path = os.path.join(out_dir, 'model_analysis.json')
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2)

    print('Analysis complete. Outputs:')
    for k, v in stats.items():
        if isinstance(v, str) and os.path.exists(v):
            print('-', k, '->', v)
        else:
            print('-', k, '->', v)

    return stats


if __name__ == '__main__':
    info = load_json('model_demo_info.json')
    analyze(info)

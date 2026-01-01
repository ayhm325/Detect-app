#!/usr/bin/env python3
import argparse
import base64
import requests
import os
import shutil


def encode_image(path):
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode('ascii')


def run(url, image_path, with_heatmap=False, outdir='python_model/bench_reports'):
    img_b64 = encode_image(image_path)
    payload = {'image_base64': img_b64, 'with_heatmap': bool(with_heatmap)}
    r = requests.post(url, json=payload, timeout=60)
    r.raise_for_status()
    data = r.json()
    os.makedirs(outdir, exist_ok=True)
    # save response
    fname = os.path.basename(image_path)
    base = os.path.splitext(fname)[0]
    resp_path = os.path.join(outdir, f'{base}_response.json')
    with open(resp_path, 'w', encoding='utf-8') as fh:
        import json
        json.dump(data, fh, indent=2)
    print('Saved response to', resp_path)

    heatmap_url = data.get('heatmap_url')
    if heatmap_url:
        # heatmap_url expected to be like /uploads/heatmap_xxx.png
        # map to project public folder
        rel = heatmap_url.lstrip('/')
        src = os.path.join(os.path.dirname(__file__), '..', rel)
        src = os.path.abspath(src)
        if os.path.exists(src):
            dst = os.path.join(outdir, os.path.basename(src))
            shutil.copy(src, dst)
            print('Copied heatmap to', dst)
        else:
            print('Heatmap reported but file not found on disk:', src)

    return data


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--url', default='http://127.0.0.1:8000/predict')
    p.add_argument('--image', required=True)
    p.add_argument('--with-heatmap', action='store_true')
    args = p.parse_args()
    data = run(args.url, args.image, with_heatmap=args.with_heatmap)
    print(data)

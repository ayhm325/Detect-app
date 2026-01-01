#!/usr/bin/env python3
#!/usr/bin/env python3
import glob
import os
import shutil

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'uploads'))
dst_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'bench_reports'))
os.makedirs(dst_dir, exist_ok=True)

pattern = os.path.join(src_dir, 'heatmap_*.png')
files = glob.glob(pattern)
if not files:
    print('No heatmap files found in', src_dir)
    raise SystemExit(1)

copied = []
for f in files:
    dst = os.path.join(dst_dir, os.path.basename(f))
    shutil.copy(f, dst)
    copied.append(dst)
    print('Copied', f, '->', dst)

print('Copied', len(copied), 'heatmap(s) to', dst_dir)
for p in copied:
    print(' -', p)

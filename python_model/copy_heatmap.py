import shutil, os
src = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'uploads', 'heatmap_e7c5cfd3697a48eb9316220d99c0290f.png'))
dst = os.path.abspath(os.path.join(os.path.dirname(__file__), 'bench_reports', os.path.basename(src)))
os.makedirs(os.path.dirname(dst), exist_ok=True)
if os.path.exists(src):
    shutil.copy(src, dst)
    print('Copied to', dst)
else:
    print('Source not found', src)

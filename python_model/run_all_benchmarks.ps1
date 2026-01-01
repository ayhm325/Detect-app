param(
    [string]$Url = 'http://127.0.0.1:8000/predict',
    [int]$Torch_Iters = 100,
    [int]$Torch_Warmup = 5,
    [int]$Grad_Iters = 30,
    [int]$Grad_Warmup = 3,
    [int]$Concurrency = 8
)

# timestamp for filenames
$ts = (Get-Date -Format 'yyyyMMdd_HHmmss')

Write-Host "Running benchmarks against $Url (output timestamp: $ts)"

# Scenario 1: TorchScript fast path (default threads)
$f1 = "results_torchscript_${ts}.csv"
Write-Host "1) TorchScript fast -> $f1"
python python_model/benchmark.py --url $Url --iters $Torch_Iters --warmup $Torch_Warmup --concurrency 1 --csv $f1

# Scenario 2: TorchScript single-thread (CPU-thread-limited)
$f2 = "results_torchscript_1thread_${ts}.csv"
Write-Host "2) TorchScript single-thread -> $f2"
$env:OMP_NUM_THREADS = '1'
$env:MKL_NUM_THREADS = '1'
python python_model/benchmark.py --url $Url --iters $Torch_Iters --warmup $Torch_Warmup --concurrency 1 --csv $f2
# unset thread limits
Remove-Item Env:\OMP_NUM_THREADS -ErrorAction SilentlyContinue
Remove-Item Env:\MKL_NUM_THREADS -ErrorAction SilentlyContinue

# Scenario 3: PyTorch + Grad-CAM (heatmap)
$f3 = "results_gradcam_${ts}.csv"
Write-Host "3) Grad-CAM (with heatmap) -> $f3"
python python_model/benchmark.py --url $Url --iters $Grad_Iters --warmup $Grad_Warmup --with-heatmap --concurrency 1 --csv $f3

Write-Host "All done. Files: $f1, $f2, $f3"
Write-Host "Tip: open the CSVs or combine them for analysis." 

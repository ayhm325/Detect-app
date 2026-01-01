"""
export_to_onnx.py

Exports a PyTorch model to ONNX.
- If --model is provided (path to a file containing an nn.Module saved via torch.save), it will be loaded using model_inspector.load_model.
- Otherwise the script falls back to torchvision's resnet18 (untrained) for demonstration.

Example:
  .venv\Scripts\python export_to_onnx.py --output resnet18.onnx
  .venv\Scripts\python export_to_onnx.py --model my_model.pt --output my_model.onnx

"""
from typing import Tuple
import argparse
import torch
import os

try:
    from model_inspector import load_model
except Exception:
    load_model = None


def parse_shape(s: str) -> Tuple[int, ...]:
    parts = [int(x.strip()) for x in s.split(",") if x.strip()]
    return tuple(parts)


def main():
    parser = argparse.ArgumentParser(description="Export PyTorch model to ONNX")
    parser.add_argument("--model", type=str, default=None, help="Path to saved nn.Module (torch.save(model)). Optional; if omitted uses torchvision.resnet18")
    parser.add_argument("--output", type=str, default="model.onnx", help="Output ONNX filename")
    parser.add_argument("--input-shape", type=str, default="1,3,224,224", help="Input shape, e.g. 1,3,224,224")
    parser.add_argument("--opset", type=int, default=11, help="ONNX opset version")
    parser.add_argument("--dynamic", action="store_true", help="Enable dynamic batch axis for input/output")
    args = parser.parse_args()

    input_shape = parse_shape(args.input_shape)

    # Load model
    model = None
    if args.model:
        if load_model is None:
            raise RuntimeError("model_inspector.load_model not available in PYTHONPATH")
        model = load_model(args.model, map_location="cpu")
    else:
        try:
            from torchvision import models
            model = models.resnet18(pretrained=False)
        except Exception:
            # fallback tiny model
            import torch.nn as nn
            model = nn.Sequential(
                nn.Conv2d(3, 8, kernel_size=3, stride=2, padding=1),
                nn.ReLU(),
                nn.AdaptiveAvgPool2d((1, 1)),
                nn.Flatten(),
                nn.Linear(8, 10),
            )

    model.eval()

    dummy = torch.zeros(input_shape, dtype=torch.float32)

    output_path = os.path.abspath(args.output)

    dynamic_axes = None
    if args.dynamic:
        dynamic_axes = {'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}

    # Export
    try:
        torch.onnx.export(
            model,
            dummy,
            output_path,
            opset_version=args.opset,
            do_constant_folding=True,
            input_names=['input'],
            output_names=['output'],
            dynamic_axes=dynamic_axes,
        )
        print(f"Exported ONNX model to: {output_path}")
    except Exception as e:
        print("ONNX export failed:", e)


if __name__ == '__main__':
    main()

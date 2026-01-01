"""
model_inspector_demo.py

Runs a small demo using `model_inspector.summarize_model`.
Tries to load a `torchvision` model (ResNet18). If torchvision is absent,
it falls back to a tiny custom model.

Generates `model_demo_info.json` in the repo root.
"""
import json
import os

import torch
import torch.nn as nn

from model_inspector import summarize_model


def make_toy_model():
    # simple conv net for demo purposes
    return nn.Sequential(
        nn.Conv2d(3, 8, kernel_size=3, stride=2, padding=1),
        nn.ReLU(),
        nn.Conv2d(8, 16, kernel_size=3, stride=2, padding=1),
        nn.AdaptiveAvgPool2d((1, 1)),
        nn.Flatten(),
        nn.Linear(16, 10),
    )


def main():
    # prefer torchvision if available
    try:
        from torchvision import models
        print("Using torchvision.models.resnet18 for demo (untrained).")
        model = models.resnet18(pretrained=False)
    except Exception as e:
        print("torchvision not available or failed to import; using toy model:", e)
        model = make_toy_model()

    # run inspector
    info = summarize_model(model, input_size=(1, 3, 224, 224), device=None, visualize=False, save_json_path="model_demo_info.json")

    # print summary header
    header = {
        "model_class": info["model_class"],
        "total_parameters": info["total_parameters"],
        "trainable_parameters": info["trainable_parameters"],
        "layers_count": info["layers_count"],
        "input_shape": info["input_shape"],
        "output_shape": info["output_shape"],
        "device": info["device"],
    }
    print(json.dumps(header, indent=2))

    out_path = os.path.abspath("model_demo_info.json")
    print("JSON saved to:", out_path)


if __name__ == "__main__":
    main()

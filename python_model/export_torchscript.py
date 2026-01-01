import torch
import torch.nn as nn
from torchvision import models
import os

MODEL_PTH = os.path.join(os.path.dirname(__file__), 'best_densenet169_xray.pth')
OUT_PATH = os.path.join(os.path.dirname(__file__), 'best_densenet169_xray_scripted.pt')


def build_model():
    model = models.densenet169(pretrained=False)
    num_features = model.classifier.in_features
    model.classifier = nn.Linear(num_features, 2)
    return model


def main():
    if not os.path.exists(MODEL_PTH):
        raise SystemExit(f"Model .pth not found at {MODEL_PTH}. Place your trained file there.")

    device = torch.device('cpu')
    model = build_model()
    state = torch.load(MODEL_PTH, map_location=device)
    model.load_state_dict(state)
    model.eval()

    # Use tracing: DenseNet is pure Modules, tracing is appropriate for inference-only
    example = torch.randn(1, 3, 224, 224)
    print(f"Tracing model to {OUT_PATH}...")
    traced = torch.jit.trace(model, example)
    traced.save(OUT_PATH)
    print("Saved scripted model at:", OUT_PATH)


if __name__ == '__main__':
    main()

import torch
import torch.nn.functional as F
from torchvision import models, transforms
import cv2
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
import os

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Resolve model path with sensible fallbacks to support consolidation into ai/models/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FALLBACK_PATHS = [
    os.path.join(BASE_DIR, '..', 'ai', 'models', 'best_densenet121_xray.pth'),
    os.path.join(BASE_DIR, 'best_densenet121_xray.pth'),
    os.path.join(BASE_DIR, '..', 'best_densenet121_xray.pth'),
]

MODEL_PATH = None
for p in FALLBACK_PATHS:
    p = os.path.normpath(p)
    if os.path.exists(p):
        MODEL_PATH = p
        break

if MODEL_PATH is None:
    # keep the original basename as last resort (may rely on working dir)
    MODEL_PATH = 'best_densenet121_xray.pth'
    print('WARNING: model file not found in ai/models/backend/root fallbacks; using', MODEL_PATH)
NUM_CLASSES = 2

# =====================
# Load Model
# =====================
model = models.densenet121(weights=None)
model.classifier = torch.nn.Linear(
    model.classifier.in_features,
    NUM_CLASSES
)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()

# =====================
# Hook variables
# =====================
gradients = None
activations = None

def backward_hook(module, grad_input, grad_output):
    global gradients
    gradients = grad_output[0]

def forward_hook(module, input, output):
    global activations
    activations = output

# 🔥 آخر Conv Layer في DenseNet
target_layer = model.features.norm5
target_layer.register_forward_hook(forward_hook)
target_layer.register_backward_hook(backward_hook)

# =====================
# Image Transform
# =====================
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# =====================
# Load Image
# =====================
img_path = "test_image.jpg"  # عدّل المسار
image = Image.open(img_path).convert("RGB")
input_tensor = transform(image).unsqueeze(0).to(DEVICE)

# =====================
# Forward + Backward
# =====================
output = model(input_tensor)
pred_class = output.argmax(dim=1).item()

model.zero_grad()
output[0, pred_class].backward()

# =====================
# Grad-CAM
# =====================
grads = gradients.cpu().data.numpy()[0]
acts = activations.cpu().data.numpy()[0]

weights = np.mean(grads, axis=(1, 2))
cam = np.zeros(acts.shape[1:], dtype=np.float32)

for i, w in enumerate(weights):
    cam += w * acts[i]

cam = np.maximum(cam, 0)
cam = cv2.resize(cam, (224, 224))
cam = cam / cam.max()

# =====================
# Overlay Heatmap
# =====================
img = cv2.imread(img_path)
img = cv2.resize(img, (224, 224))

heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
overlay = cv2.addWeighted(img, 0.6, heatmap, 0.4, 0)

# =====================
# Show Result
# =====================
plt.figure(figsize=(6,6))
plt.imshow(cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB))
plt.title(f"Grad-CAM | Class: {pred_class}")
plt.axis("off")
plt.show()
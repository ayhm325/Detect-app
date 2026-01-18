from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import base64
from io import BytesIO
from PIL import Image
import torch
from torchvision import transforms, models
import os
import time
import uuid
import numpy as np
import matplotlib.pyplot as plt


class PredictRequest(BaseModel):
    image_base64: str
    with_heatmap: bool = False


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Prefer consolidated models directory, fallback to backend or repo root
FALLBACK_PATHS = [
    os.path.join(BASE_DIR, '..', 'ai', 'models', 'best_densenet121_xray.pth'),
    os.path.join(BASE_DIR, '..', 'backend', 'best_densenet121_xray.pth'),
    os.path.join(BASE_DIR, '..', 'best_densenet121_xray.pth'),
]

MODEL_PATH = None
for p in FALLBACK_PATHS:
    p = os.path.normpath(p)
    if os.path.exists(p):
        MODEL_PATH = p
        break

if MODEL_PATH is None:
    MODEL_PATH = os.path.join(BASE_DIR, '..', 'backend', 'best_densenet121_xray.pth')
    print('WARNING: model not found in ai/models; using', MODEL_PATH)
STATIC_DIR = os.path.join(BASE_DIR, "static")
HEATMAP_DIR = os.path.join(STATIC_DIR, "heatmaps")

os.makedirs(HEATMAP_DIR, exist_ok=True)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def load_model(path):
    model = models.densenet121(weights=None)
    model.classifier = torch.nn.Linear(model.classifier.in_features, 2)
    state = torch.load(path, map_location=DEVICE)
    model.load_state_dict(state)
    model.to(DEVICE)
    model.eval()
    return model


print("Python model server starting. Loading model from:", MODEL_PATH)
if not os.path.exists(MODEL_PATH):
    print("WARNING: model file not found:", MODEL_PATH)
    MODEL = None
else:
    MODEL = load_model(MODEL_PATH)
    print("Model loaded.")

# Preprocessing similar to training script
prep_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

LABELS = {0: "NORMAL", 1: "PNEUMONIA"}


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.post("/predict")
async def predict(req: PredictRequest):
    if MODEL is None:
        raise HTTPException(status_code=503, detail="Model not loaded on server")

    try:
        img_data = base64.b64decode(req.image_base64)
        img = Image.open(BytesIO(img_data)).convert("L")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {e}")

    tensor = prep_transform(img).unsqueeze(0).to(DEVICE)

    start = time.time()
    with torch.no_grad():
        out = MODEL(tensor)
        probs = torch.softmax(out, dim=1).cpu().numpy()[0]
        pred_idx = int(probs.argmax())
        pred_label = LABELS.get(pred_idx, "Unknown")
    end = time.time()

    result = {
        "prediction": pred_label,
        "probabilities": {LABELS[i]: float(probs[i]) for i in range(len(probs))},
        "model_version": os.path.basename(MODEL_PATH),
        "heatmap_url": None,
        "inference_time_ms": int((end - start) * 1000),
    }

    # Generate a simple heatmap overlay if requested
    if req.with_heatmap:
        try:
            # create a simple heatmap from the input image intensity
            arr = np.array(img.resize((224, 224))).astype(float)
            arr = (arr - arr.min()) / (arr.max() - arr.min() + 1e-8)

            cmap = plt.get_cmap('jet')
            heatmap_rgba = cmap(arr)
            heatmap_rgb = (heatmap_rgba[:, :, :3] * 255).astype('uint8')

            heatmap_img = Image.fromarray(heatmap_rgb).convert('RGBA')

            # overlay on original (converted to RGB)
            base_rgb = img.resize((224, 224)).convert('RGB')
            base_rgba = base_rgb.convert('RGBA')

            blended = Image.blend(base_rgba, heatmap_img, alpha=0.5)

            fname = f"heatmap_{uuid.uuid4().hex}.png"
            out_path = os.path.join(HEATMAP_DIR, fname)
            blended.save(out_path)

            result['heatmap_url'] = f"http://127.0.0.1:8000/static/heatmaps/{fname}"
        except Exception as e:
            # don't fail inference because of heatmap generation
            print('Heatmap generation failed:', e)

    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

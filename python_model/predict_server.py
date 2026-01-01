from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PIL import Image
import base64
import io
import torch
import torch.nn as nn
from torchvision import models, transforms
import numpy as np
import cv2
import uuid
import os
import logging
import traceback

app = FastAPI()


class ImagePayload(BaseModel):
    image_base64: str
    with_heatmap: bool = False


MODEL_PATH = os.path.join(os.path.dirname(__file__), "best_densenet169_xray.pth")


def load_model(path=MODEL_PATH, device=None):
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = models.densenet169(pretrained=False)
    num_features = model.classifier.in_features
    model.classifier = nn.Linear(num_features, 2)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found at {path}. Place your .pth file there or set MODEL_PATH.")
    state = torch.load(path, map_location=device)
    model.load_state_dict(state)
    model.to(device)
    model.eval()
    return model, device


model, device = load_model()

# Attempt to load a TorchScript model for faster inference when heatmap is not requested.
# This allows using the scripted model for forward-only inference and the original `model`
# (nn.Module) when gradients/backward are required for Grad-CAM.
scripted_model = None
try:
    TS_PATH = os.environ.get('MODEL_TORCHSCRIPT_PATH') or os.path.join(os.path.dirname(__file__), 'best_densenet169_xray_scripted.pt')
    if os.path.exists(TS_PATH):
        try:
            scripted_model = torch.jit.load(TS_PATH, map_location=device)
            scripted_model.eval()
            print(f"Loaded TorchScript model from {TS_PATH}")
        except Exception as e:
            logging.exception(f"Failed to load TorchScript model at {TS_PATH}: {e}")
            scripted_model = None
    else:
        # no scripted model found; continue with regular model
        scripted_model = None
except Exception:
    scripted_model = None


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def decode_image(b64: str):
    try:
        data = base64.b64decode(b64)
        img = Image.open(io.BytesIO(data)).convert("RGB")
        return img
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {e}")


class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None

        # forward hook to get activations
        target_layer.register_forward_hook(self.save_activation)
        # backward hook to get gradients (use register_full_backward_hook if available)
        try:
            target_layer.register_full_backward_hook(self.save_gradient)
        except Exception:
            try:
                target_layer.register_backward_hook(self.save_gradient)
            except Exception:
                pass

    def save_activation(self, module, input, output):
        self.activations = output.detach()

    def save_gradient(self, module, grad_input, grad_output):
        # grad_output is a tuple
        self.gradients = grad_output[0].detach()

    def generate(self, class_idx):
        # activations: [B, C, H, W], gradients: [B, C, H, W]
        if self.gradients is None or self.activations is None:
            return None
        weights = self.gradients.mean(dim=(2, 3), keepdim=True)  # [B, C, 1, 1]
        cam = (weights * self.activations).sum(dim=1)  # [B, H, W]
        cam = torch.relu(cam)
        cam_min = cam.view(cam.size(0), -1).min(dim=1)[0]
        cam_max = cam.view(cam.size(0), -1).max(dim=1)[0]
        # normalize per-sample
        cams = []
        for i in range(cam.size(0)):
            c = cam[i]
            denom = (cam_max[i] - cam_min[i]).item() if (cam_max[i] - cam_min[i]).item() != 0 else 1.0
            c = (c - cam_min[i]) / denom
            cams.append(c.cpu().numpy())
        return np.stack(cams, axis=0)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(payload: ImagePayload):
    img = decode_image(payload.image_base64)
    inp = transform(img).unsqueeze(0).to(device)

    # try Grad-CAM generation when requested; fall back to simple predict
    heatmap_url = None
    try:
        # find a sensible target conv layer: search features for last Conv2d
        target_layer = None
        for m in reversed(list(model.features.modules())):
            if isinstance(m, torch.nn.Conv2d):
                target_layer = m
                break

        gradcam = None
        if target_layer is not None and payload.with_heatmap:
            gradcam = GradCAM(model, target_layer)

        # forward
        # Use TorchScript model for fast forward when heatmap not requested and scripted_model is available.
        if not payload.with_heatmap and scripted_model is not None:
            with torch.no_grad():
                out = scripted_model(inp)
        else:
            # use original model (supports backward for Grad-CAM when requested)
            if not payload.with_heatmap:
                with torch.no_grad():
                    out = model(inp)
            else:
                out = model(inp)
        probs = torch.softmax(out, dim=1).detach().cpu().numpy()[0]
        pred_idx = int(np.argmax(probs))
        classes = ["Normal", "Pneumonia"]

        # backward for grad-cam
        if gradcam is not None:
            model.zero_grad()
            # need gradient, so not in no_grad
            out[0, pred_idx].backward(retain_graph=False)
            cams = gradcam.generate(pred_idx)
            if cams is not None:
                cam = cams[0]
                # resize to original transform size (224x224)
                cam_resized = cv2.resize(cam, (224, 224))
                heatmap = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)

                # prepare original image as BGR
                orig = np.array(img.resize((224, 224)))
                if orig.dtype != np.uint8:
                    orig = (255 * (orig / np.max(orig))).astype(np.uint8)
                orig_bgr = cv2.cvtColor(orig, cv2.COLOR_RGB2BGR)
                overlay = cv2.addWeighted(orig_bgr, 0.6, heatmap, 0.4, 0)

                # save to project's public/uploads
                uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'uploads'))
                os.makedirs(uploads_dir, exist_ok=True)
                fname = f"heatmap_{uuid.uuid4().hex}.png"
                fpath = os.path.join(uploads_dir, fname)
                cv2.imwrite(fpath, overlay)
                heatmap_url = f"/uploads/{fname}"

        return {"prediction": classes[pred_idx], "probabilities": {classes[0]: float(probs[0]), classes[1]: float(probs[1])}, "heatmap_url": heatmap_url}
    except Exception as e:
        # log full exception
        logging.exception("Error during predict/Grad-CAM generation")
        tb = traceback.format_exc()

        # fallback simple prediction
        try:
            # prefer scripted model if available for fallback prediction too
            if scripted_model is not None:
                with torch.no_grad():
                    out = scripted_model(inp)
            else:
                out = model(inp)
            probs = torch.softmax(out, dim=1).detach().cpu().numpy()[0]
            pred_idx = int(np.argmax(probs))
            classes = ["Normal", "Pneumonia"]
            response = {
                "prediction": classes[pred_idx],
                "probabilities": {classes[0]: float(probs[0]), classes[1]: float(probs[1])},
                "heatmap_url": None,
            }

            # include error details in non-production for easier debugging
            if os.environ.get('NODE_ENV') != 'production':
                response['error'] = str(e)
                response['traceback'] = tb

            return response

        except Exception as e2:
            logging.exception("Fallback prediction also failed")
            tb2 = traceback.format_exc()
            detail = str(e2)
            if os.environ.get('NODE_ENV') != 'production':
                detail = f"{detail}\n\nOriginal error:\n{tb}"
            raise HTTPException(status_code=500, detail=detail)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

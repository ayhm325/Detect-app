import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score, confusion_matrix
import numpy as np
import os

# =====================
# Settings
# =====================
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

print("DATASET_DIR =", DATASET_DIR)
print("TRAIN EXISTS =", os.path.exists(os.path.join(DATASET_DIR, "train")))
BATCH_SIZE = 16
EPOCHS = 18
LR = 1e-4
NUM_CLASSES = 2
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_PATH = "best_densenet121_xray.pth"

# =====================
# Transforms (X-ray friendly)
# =====================
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

test_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# =====================
# Dataset
# =====================
train_data = datasets.ImageFolder(
    os.path.join(DATASET_DIR, "train"),
    transform=train_transform
)

test_data = datasets.ImageFolder(
    os.path.join(DATASET_DIR, "test"),
    transform=test_transform
)

train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True)
test_loader = DataLoader(test_data, batch_size=BATCH_SIZE, shuffle=False)

# =====================
# Class Weights (imbalance fix)
# =====================
class_counts = np.bincount(train_data.targets)
class_weights = torch.tensor(
    [1.0 / c for c in class_counts],
    dtype=torch.float
).to(DEVICE)

# =====================
# Model
# =====================
model = models.densenet121(weights="IMAGENET1K_V1")

# Freeze backbone
for param in model.features.parameters():
    param.requires_grad = False

model.classifier = nn.Linear(
    model.classifier.in_features,
    NUM_CLASSES
)

model = model.to(DEVICE)

# =====================
# Loss & Optimizer
# =====================
criterion = nn.CrossEntropyLoss(
    weight=class_weights,
    label_smoothing=0.1
)

optimizer = optim.Adam(
    model.classifier.parameters(),
    lr=LR
)

scheduler = optim.lr_scheduler.ReduceLROnPlateau(
    optimizer,
    mode="min",
    factor=0.5,
    patience=3
)

# =====================
# Training
# =====================
best_acc = 0.0

for epoch in range(EPOCHS):
    model.train()
    total_loss = 0

    # 🔓 Fine-tuning بعد Epoch 6
    if epoch == 6:
        print("🔓 Unfreezing last dense block")
        for param in model.features.denseblock4.parameters():
            param.requires_grad = True

        optimizer = optim.Adam(
            filter(lambda p: p.requires_grad, model.parameters()),
            lr=1e-5
        )

    for images, labels in train_loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    avg_loss = total_loss / len(train_loader)

    # =====================
    # Evaluation
    # =====================
    model.eval()
    y_true, y_pred = [], []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(DEVICE)
            outputs = model(images)
            preds = torch.argmax(outputs, dim=1)

            y_true.extend(labels.numpy())
            y_pred.extend(preds.cpu().numpy())

    acc = accuracy_score(y_true, y_pred)
    scheduler.step(avg_loss)

    print(f"Epoch [{epoch+1}/{EPOCHS}] | Loss: {avg_loss:.4f} | Acc: {acc:.4f}")

    if acc > best_acc:
        best_acc = acc
        torch.save(model.state_dict(), MODEL_PATH)
        print("✅ Best model saved")

# =====================
# Final Metrics
# =====================
cm = confusion_matrix(y_true, y_pred)
print("\nConfusion Matrix:")
print(cm)
print(f"\nBest Test Accuracy: {best_acc:.4f}")
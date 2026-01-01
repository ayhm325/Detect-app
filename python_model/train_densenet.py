import torch
import torch.nn as nn
from torchvision import models, transforms, datasets
from torch.utils.data import DataLoader, random_split
from PIL import Image
import matplotlib.pyplot as plt
from sklearn.metrics import f1_score, roc_auc_score, roc_curve
import numpy as np
import os
import zipfile
from kaggle.api.kaggle_api_extended import KaggleApi

# ---------------------------
# تحميل Dataset من Kaggle
# ---------------------------
dataset_dir = "chest_xray_dataset"

if not os.path.exists(dataset_dir):
    os.makedirs(dataset_dir)
    api = KaggleApi()
    api.authenticate()  # يجب وضع Kaggle API Token في ~/.kaggle/kaggle.json
    print("Downloading dataset from Kaggle...")
    api.dataset_download_files('paultimothymooney/chest-xray-pneumonia', path=dataset_dir, unzip=True)

# تحديد المسار إلى الصور
data_dir = os.path.join(dataset_dir, "chest_xray")  # يحتوي على train/val/test

# ---------------------------
# إعداد التحويلات
# ---------------------------
train_transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
])
test_transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
])

# ---------------------------
# تحميل البيانات
# ---------------------------
# الدمج بين train + val للتقسيم الجديد
full_dataset = datasets.ImageFolder(os.path.join(data_dir, "train"), transform=train_transform)

# تقسيم البيانات (80% Train / 10% Val / 10% Test)
train_size = int(0.8*len(full_dataset))
val_size = int(0.1*len(full_dataset))
remaining = len(full_dataset) - train_size - val_size
train_dataset, val_dataset, _ = random_split(full_dataset, [train_size, val_size, remaining])
val_dataset.dataset.transform = test_transform

# Test Dataset
test_dataset = datasets.ImageFolder(os.path.join(data_dir,"test"), transform=test_transform)

# DataLoaders
train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=16, shuffle=False)
test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False)

# ---------------------------
# إعداد نموذج DenseNet-169
# ---------------------------
model = models.densenet169(pretrained=True)
num_features = model.classifier.in_features
model.classifier = nn.Linear(num_features, 2)  # Normal / Pneumonia

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)

# ---------------------------
# دالة التدريب مع رسم منحنيات
# ---------------------------
def train_model(model, train_loader, val_loader, criterion, optimizer, epochs=10):
    best_val_acc = 0
    train_losses, val_accs = [], []

    for epoch in range(epochs):
        model.train()
        running_loss = 0
        correct = 0
        total = 0

        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            _, predicted = torch.max(outputs.data,1)
            total += labels.size(0)
            correct += (predicted==labels).sum().item()

        train_loss = running_loss/len(train_loader)
        train_acc = 100*correct/total
        train_losses.append(train_loss)

        # Validation
        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                _, predicted = torch.max(outputs,1)
                val_total += labels.size(0)
                val_correct += (predicted==labels).sum().item()
        val_acc = 100*val_correct/val_total
        val_accs.append(val_acc)

        print(f"Epoch {epoch+1}/{epochs} | Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}% | Val Acc: {val_acc:.2f}%")

        # حفظ أفضل نموذج
        if val_acc>best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(),"best_densenet169_xray.pth")

    # رسم منحنيات
    plt.figure(figsize=(10,4))
    plt.subplot(1,2,1)
    plt.plot(train_losses,label='Train Loss')
    plt.xlabel('Epoch'); plt.ylabel('Loss'); plt.legend()
    plt.subplot(1,2,2)
    plt.plot(val_accs,label='Val Accuracy')
    plt.xlabel('Epoch'); plt.ylabel('Accuracy (%)'); plt.legend()
    plt.show()

# ---------------------------
# دالة التقييم المتقدم
# ---------------------------
def evaluate_model(model, loader):
    model.eval()
    all_labels, all_preds, all_probs = [], [], []

    with torch.no_grad():
        for inputs, labels in loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            probs = torch.softmax(outputs, dim=1)[:,1]  # احتمال Pneumonia
            _, predicted = torch.max(outputs,1)

            all_labels.extend(labels.cpu().numpy())
            all_preds.extend(predicted.cpu().numpy())
            all_probs.extend(probs.cpu().numpy())

    accuracy = 100*np.sum(np.array(all_preds)==np.array(all_labels))/len(all_labels)
    f1 = f1_score(all_labels, all_preds)
    try:
        auc = roc_auc_score(all_labels, all_probs)
    except:
        auc = 0.0

    print(f"Accuracy: {accuracy:.2f}% | F1-score: {f1:.4f} | AUC: {auc:.4f}")

    # رسم ROC
    fpr,tpr,_ = roc_curve(all_labels, all_probs)
    plt.figure()
    plt.plot(fpr,tpr,label=f"AUC={auc:.4f}")
    plt.plot([0,1],[0,1],'--',color='gray')
    plt.xlabel("False Positive Rate"); plt.ylabel("True Positive Rate")
    plt.title("ROC Curve")
    plt.legend()
    plt.show()

# ---------------------------
# توقع صورة واحدة
# ---------------------------
def predict_image(image_path, model):
    model.eval()
    image = Image.open(image_path).convert('RGB')
    transform = transforms.Compose([
        transforms.Resize((224,224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
    ])
    image = transform(image).unsqueeze(0).to(device)
    output = model(image)
    _, pred = torch.max(output,1)
    classes = ["Normal","Pneumonia"]
    return classes[pred.item()]

# ---------------------------
# مثال الاستخدام
# ---------------------------
#train_model(model, train_loader, val_loader, criterion, optimizer, epochs=10)
evaluate_model(model, test_loader)
#print(predict_image("path_to_sample_xray.jpg", model))

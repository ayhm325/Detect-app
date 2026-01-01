"""
create_demo_viz.py

Small helper to run a visualization demo using `model_inspector.summarize_model`.
Generates `reports/model_graph.svg` and `model_demo_info_visual.json`.
"""
from pathlib import Path
from model_inspector import summarize_model
import torchvision.models as models


def main():
    out_dir = Path("reports")
    out_dir.mkdir(exist_ok=True)

    # instantiate untrained ResNet18 (same as demo)
    model = models.resnet18(weights=None)

    print("Running visualization demo (ResNet18) ...")
    info = summarize_model(
        model,
        input_size=(1, 3, 224, 224),
        device="cpu",
        visualize=True,
        viz_path=str(out_dir / "model_graph"),
        save_json_path=str(Path("model_demo_info_visual.json")),
    )
    print("Done. Visuals saved to:")
    if "_visualization" in info:
        print(info["_visualization"]["path"])
    if "_visualization_error" in info:
        print("Visualization error:", info["_visualization_error"])


if __name__ == '__main__':
    main()

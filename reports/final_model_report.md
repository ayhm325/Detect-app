**Final Model Export & Analysis Report**

This report collects the generated machine- and human-readable artifacts for easy review and sharing.

- **Model Summary (JSON)**: [model_demo_info.json](model_demo_info.json)
- **Analysis JSON**: [reports/model_analysis.json](reports/model_analysis.json)

**Analysis Images**
- **Parameters histogram**: [reports/params_histogram.png](reports/params_histogram.png)
- **Top layers (by params)**: [reports/top_layers.png](reports/top_layers.png)
- **Trainable vs non-trainable**: [reports/trainable_pie.png](reports/trainable_pie.png)
- **Params by layer type**: [reports/params_by_type.png](reports/params_by_type.png)

**Architecture Visualizations**
- **Networkx fallback (SVG)**: [model_graph_networkx.svg](model_graph_networkx.svg)
- **Networkx fallback (PNG)**: [model_graph_networkx.png](model_graph_networkx.png)

**Interactive Viewer Screenshot**
- **Netron screenshot**: [netron_screenshot.png](netron_screenshot.png)

**Notes & Next Steps**
- The original `torchviz` → Graphviz rendering produced DOT syntax errors for some labels; a sanitized approach (remove param-name labels) or further label-escaping may allow regenerating the original SVG in the future.
- To regenerate artifacts locally, run:

```powershell
.venv\Scripts\python model_inspector_demo.py
.venv\Scripts\python analyze_model_json.py
.venv\Scripts\python viz_networkx.py
# Start Netron (separate shell):
.venv\Scripts\netron resnet18.onnx --host 127.0.0.1 --port 8080
# Capture Netron (in another shell):
.venv\Scripts\python netron_capture.py
```

Files are workspace-relative and ready for review or packaging.

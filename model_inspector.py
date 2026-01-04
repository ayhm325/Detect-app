"""
model_inspector.py

Usage examples:
- Inspect an in-memory model object:
    info = summarize_model(my_model, input_size=(1,3,224,224))

- Inspect a saved file (if file contains an nn.Module object):
    model = load_model("model.pt", map_location="cpu")
    info = summarize_model(model, input_size=(1,3,224,224))

- Save JSON:
    summarize_model(model, input_size=(1,3,224,224), save_json_path="model_info.json")

- Visualize (requires graphviz + torchviz):
    summarize_model(model, input_size=(1,3,224,224), visualize=True, viz_path="model_graph")

Notes:
- If a file contains only a `state_dict`, you must provide the matching `nn.Module` class and call `model.load_state_dict()`.
- Input shape must match model's forward signature (single tensor or tuple of tensors).
"""

from typing import Union, Tuple, List, Dict, Any
import json
import torch
import torch.nn as nn
import os

try:
    from torchviz import make_dot
    _HAS_TORCHVIZ = True
except Exception:
    _HAS_TORCHVIZ = False


def load_model(path_or_module: Union[str, os.PathLike, nn.Module], map_location: Union[str, torch.device] = "cpu") -> nn.Module:
    """
    Load a PyTorch model from a file or return the model if an nn.Module provided.

    - If `path_or_module` is a string/path, this tries `torch.load`.
      - If the loaded object is an `nn.Module`, return it.
      - If a `state_dict` (dict) is returned, raise informative error.
    - If `path_or_module` is an `nn.Module`, return it (no-op).
    """
    if isinstance(path_or_module, nn.Module):
        return path_or_module

    path = str(path_or_module)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model path not found: {path}")

    loaded = torch.load(path, map_location=map_location)

    # If file contains a saved module object:
    if isinstance(loaded, nn.Module):
        return loaded

    # If file contains something else (state_dict or other), be explicit:
    if isinstance(loaded, dict):
        # heuristic: many state dicts map parameter names to tensors
        if all(isinstance(v, torch.Tensor) for v in loaded.values()):
            raise ValueError(
                "Loaded object looks like a state_dict (mapping param-name -> tensor).\n"
                "Please instantiate your model class and call `model.load_state_dict(...)` "
                "then pass the model instance to the inspector."
            )
    raise ValueError("Loaded file does not appear to be an `nn.Module` instance. "
                     "If it contains a state_dict, load it into your model instance first.")


def _format_shape(x: Any) -> Any:
    """Return a serializable shape representation for a tensor or nested outputs."""
    if isinstance(x, torch.Tensor):
        return tuple(x.size())
    if isinstance(x, (list, tuple)):
        return [_format_shape(e) for e in x]
    if isinstance(x, dict):
        return {k: _format_shape(v) for k, v in x.items()}
    # fallback
    return str(type(x))


def summarize_model(
    model: nn.Module,
    input_size: Union[Tuple[int, ...], List[Tuple[int, ...]]] = (1, 3, 224, 224),
    device: Union[str, torch.device, None] = None,
    dtype: torch.dtype = torch.float32,
    visualize: bool = False,
    viz_path: str = "model_viz",
    save_json_path: Union[str, None] = None,
) -> Dict[str, Any]:
    """
    Summarize a model.

    Args:
      - model: nn.Module instance
      - input_size: shape tuple for a single input tensor, or list/tuple for multiple inputs
      - device: e.g. "cpu", "cuda:0", or None to auto-detect
      - dtype: dtype for dummy input
      - visualize: if True, attempt to make a graph visualization (requires torchviz)
      - viz_path: path prefix for saved visualization (if supported)
      - save_json_path: if provided, writes summary JSON to this file

    Returns:
      A dictionary containing all summary fields.
    """
    # Device selection
    if device is None:
        device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    else:
        device = torch.device(device)

    # Move model to device (clone not used; we mutate placement temporarily)
    model_device = next(model.parameters(), None)
    orig_device = None
    if model_device is not None:
        orig_device = next(model.parameters()).device
    model = model.to(device)
    model.eval()

    # Normalize input_size into a list (support single or multiple inputs)
    if isinstance(input_size, tuple):
        input_shapes = [input_size]
    elif isinstance(input_size, list):
        input_shapes = input_size
    else:
        raise TypeError("input_size must be a tuple or list of tuples")

    # Create dummy inputs
    dummy_inputs = []
    for shape in input_shapes:
        if not isinstance(shape, tuple):
            raise TypeError("Each input shape must be a tuple, e.g. (1,3,224,224)")
        dummy = torch.zeros(shape, dtype=dtype, device=device)
        dummy_inputs.append(dummy)

    # If single input, we'll pass single tensor instead of list
    forward_args = dummy_inputs[0] if len(dummy_inputs) == 1 else tuple(dummy_inputs)

    # Prepare storage for per-layer info
    layer_infos = {}
    hooks = []

    def register_hook(name):
        def hook(module, inputs, output):
            # count params of this module
            params = sum(p.numel() for p in module.parameters(recurse=False))
            trainable = sum(p.numel() for p in module.parameters(recurse=False) if p.requires_grad)
            info = layer_infos.setdefault(name, {})
            info['type'] = module.__class__.__name__
            info['params'] = int(params)
            info['trainable_params'] = int(trainable)
            # capture output shape(s)
            info['output_shape'] = _format_shape(output)
        return hook

    # Register hooks on leaf modules to get outputs. We use named_modules to have stable names.
    for name, module in model.named_modules():
        # skip the top-level module's hook (the model itself) to avoid duplicating
        if name == "":
            continue
        # Only attach to modules that are not containers or have parameters or produce outputs
        # We attach to all modules to show architecture; filter later if needed.
        h = module.register_forward_hook(register_hook(name))
        hooks.append(h)

    # Run forward to collect shapes. Wrap in torch.no_grad() since we only need shapes.
    with torch.no_grad():
        try:
            output = model(forward_args) if isinstance(forward_args, tuple) else model(forward_args)
        except TypeError:
            # some models accept *inputs rather than a tuple; try expanding
            if isinstance(forward_args, tuple):
                output = model(*forward_args)
            else:
                raise

    # Remove hooks
    for h in hooks:
        h.remove()

    # Compute parameter counts across entire model
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

    # Count layers as number of unique submodules (excluding the top-level container)
    all_named_modules = [name for name, _ in model.named_modules() if name != ""]
    layers_count = len(all_named_modules)

    # Try to capture input and output shapes
    input_shapes_serialized = [_format_shape(t) for t in dummy_inputs]
    output_shape_serialized = _format_shape(output)

    # Build sorted per-layer list (in order of model.named_modules)
    per_layer = []
    for name, module in model.named_modules():
        if name == "":
            continue
        info = layer_infos.get(name, {})
        per_layer.append({
            "name": name,
            "type": info.get("type", module.__class__.__name__),
            "output_shape": info.get("output_shape", None),
            "params": int(info.get("params", sum(p.numel() for p in module.parameters(recurse=False)))),
            "trainable_params": int(info.get("trainable_params", sum(p.numel() for p in module.parameters(recurse=False) if p.requires_grad))),
        })

    # Model identity
    model_class = model.__class__.__name__
    device_str = str(device)

    summary = {
        "model_class": model_class,
        "total_parameters": int(total_params),
        "trainable_parameters": int(trainable_params),
        "layers_count": int(layers_count),
        "layers": per_layer,
        "input_shape": input_shapes_serialized if len(input_shapes_serialized) > 1 else input_shapes_serialized[0],
        "output_shape": output_shape_serialized,
        "device": device_str,
        "dtype": str(dtype),
    }

    # Optionally visualize architecture
    if visualize:
        if not _HAS_TORCHVIZ:
            # attempt to explain missing dependency
            summary["_visualization_error"] = "torchviz not installed. Install with `pip install torchviz graphviz` and ensure Graphviz is available on PATH."
        else:
            try:
                # make_dot expects a scalar/tensor or tuple/dict of tensors; adapt output
                # If output is not a tensor (e.g., tuple), provide first tensor as proxy
                gv_out = None
                if isinstance(output, torch.Tensor):
                    gv_out = output
                elif isinstance(output, (list, tuple)):
                    # pick first tensor-like element
                    for o in output:
                        if isinstance(o, torch.Tensor):
                            gv_out = o
                            break
                elif isinstance(output, dict):
                    for o in output.values():
                        if isinstance(o, torch.Tensor):
                            gv_out = o
                            break
                if gv_out is None:
                    summary["_visualization_error"] = "Could not find a tensor output to visualize."
                else:
                    # create graph but sanitize DOT labels before rendering. Some
                    # module/shape/param labels contain characters that break
                    # Graphviz DOT syntax on Windows; to be robust we remove
                    # inline label attributes from the DOT source before render.
                    graph = make_dot(gv_out, params=None)
                    try:
                        dot_src = graph.source
                        # Remove label attributes entirely to avoid syntax errors.
                        # This preserves node connectivity while dropping textual labels.
                        import re
                        sanitized = re.sub(r'label\s*=\s*"[^"]*"', '', dot_src)
                        # Render sanitized DOT using graphviz.Source
                        try:
                            from graphviz import Source
                            s = Source(sanitized)
                            s.format = 'svg'
                            s.render(filename=viz_path, cleanup=True)
                            svg_path = viz_path + '.svg'
                            summary["_visualization"] = {"rendered": True, "path": os.path.abspath(svg_path)}
                        except Exception:
                            # fallback: write sanitized dot to file and try system dot
                            dot_file = viz_path + '.dot'
                            with open(dot_file, 'w', encoding='utf-8') as f:
                                f.write(sanitized)
                            # attempt to call dot to render svg
                            try:
                                import subprocess
                                subprocess.check_call(['dot', '-Tsvg', dot_file, '-o', viz_path + '.svg'])
                                summary["_visualization"] = {"rendered": True, "path": os.path.abspath(viz_path + '.svg')}
                            except Exception as e:
                                summary["_visualization_error"] = f"Sanitized render failed: {e}"
                    except Exception as e:
                        summary["_visualization_error"] = f"Failed to sanitize/prepare DOT: {e}"
            except Exception as e:
                summary["_visualization_error"] = f"Visualization failed: {e}"

    # Optionally save JSON
    if save_json_path:
        with open(save_json_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2)
    return summary


if __name__ == "__main__":
    # Example CLI-like demo; adjust path and input size as needed
    import argparse

    parser = argparse.ArgumentParser(description="Inspect a PyTorch model and print a detailed summary.")
    parser.add_argument("--model", type=str, default=None, help="Path to saved model (.pt/.pth) containing an nn.Module. If omitted, you must import the script and call summarize_model().")
    parser.add_argument("--input-shape", type=str, default="1,3,224,224", help="Comma-separated input shape, e.g. '1,3,224,224'. For multiple inputs, separate groups with ';' like '1,3,224,224;1,10'.")
    parser.add_argument("--device", type=str, default=None, help="Device string like 'cpu' or 'cuda:0'.")
    parser.add_argument("--visualize", action="store_true", help="Attempt to render model graph (requires torchviz).")
    parser.add_argument("--save-json", type=str, default=None, help="Path to save JSON summary.")
    args = parser.parse_args()

    if args.model is None:
        print("No model path provided. Please import the script and call `summarize_model(model, ...)` with a model instance.")
        exit(1)

    # parse input shape(s)
    groups = [g.strip() for g in args.input_shape.split(";") if g.strip()]
    parsed_shapes = []
    for g in groups:
        parts = tuple(int(x.strip()) for x in g.split(",") if x.strip())
        parsed_shapes.append(parts)
    input_size = parsed_shapes[0] if len(parsed_shapes) == 1 else parsed_shapes

    model = load_model(args.model, map_location=args.device or "cpu")
    info = summarize_model(model, input_size=input_size, device=args.device, visualize=args.visualize, save_json_path=args.save_json)
    # print human-friendly summary
    print(json.dumps({
        "model_class": info["model_class"],
        "total_parameters": info["total_parameters"],
        "trainable_parameters": info["trainable_parameters"],
        "layers_count": info["layers_count"],
        "input_shape": info["input_shape"],
        "output_shape": info["output_shape"],
        "device": info["device"],
    }, indent=2))
    # print per-layer details in compact form
    print("\nPer-layer details (first 100 lines):")
    for layer in info["layers"]:
        print(f"- {layer['name']}: {layer['type']}, params={layer['params']}, trainable={layer['trainable_params']}, output_shape={layer['output_shape']}")

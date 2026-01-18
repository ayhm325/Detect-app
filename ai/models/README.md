Place ML model files here (e.g. best_densenet121_xray.pth).

Purpose:

- Central location for models used by `python_model` and `backend` scripts.

Migration steps:

1. Move existing `best_densenet121_xray.pth` files into this directory.
2. Confirm scripts can locate the model. Scripts support fallbacks if the model was not moved.

Notes:

- The code now looks for the model in `ai/models/`, then `backend/`, then repo root.
- You can safely clean up duplicate copies after verifying everything works.

# Model Conversion Guide

## Quick Start

Run this command to convert the model:

```bash
python3 convert_model_to_onnx.py
```

## Prerequisites

Install required Python packages:

```bash
pip3 install transformers torch onnx optimum[exporters]
```

Or if you prefer conda:

```bash
conda install -c conda-forge transformers pytorch onnx
pip install optimum[exporters]
```

## What the Script Does

1. **Downloads** the `wambugu71/crop_leaf_diseases_vit` model from Hugging Face
2. **Converts** it from PyTorch (.safetensors) to ONNX (.onnx) format
3. **Saves** all files to `./crop_disease_model_onnx/` directory
4. **Verifies** that all required files are present

## Expected Output

After running, you should see:

```
crop_disease_model_onnx/
├── model.onnx              (~84 MB)
├── config.json             (model configuration)
└── preprocessor_config.json (image preprocessing settings)
```

## After Conversion

### Option 1: Upload to Hugging Face (Recommended)

1. Create account at https://huggingface.co if you don't have one
2. Create a new model repository
3. Upload all files from `crop_disease_model_onnx/`
4. Update `lib/modelUtils.js` line 55:
   ```javascript
   'YOUR_USERNAME/crop_disease_model_onnx'
   ```

### Option 2: Use Locally (Testing Only)

1. Copy ONNX files to your project:
   ```bash
   cp crop_disease_model_onnx/* public/models/
   ```

2. Update `lib/modelUtils.js` to use local path (requires additional configuration)

## Troubleshooting

### "ModuleNotFoundError: No module named 'transformers'"
```bash
pip3 install transformers torch onnx optimum[exporters]
```

### "ONNX export failed"
Try upgrading packages:
```bash
pip3 install --upgrade transformers optimum torch
```

### "Out of memory"
The conversion needs ~2-3 GB RAM. Close other applications and try again.

### "Model download failed"
Check your internet connection and try again. The model is ~300 MB.

## Estimated Time

- **First time**: 5-10 minutes (downloads model + converts)
- **Subsequent runs**: 2-3 minutes (uses cached model)

## Need Help?

If you encounter issues:
1. Check the error message in the script output
2. Verify Python version: `python3 --version` (need 3.8+)
3. Ensure pip is up to date: `pip3 install --upgrade pip`

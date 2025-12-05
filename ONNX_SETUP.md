# ONNX Model Setup Guide

This guide explains how to set up the ONNX model for browser-based crop disease detection.

## Quick Setup

The model should already be downloaded if you've run the setup commands. If not, follow the manual download steps below.

### Verify Model Installation

Check if the model file exists and has the correct size:

```bash
ls -lh public/models/model.onnx
```

The file should be approximately **84 MB**. If the file is missing or much smaller, follow the manual download steps.

## Manual Download

If the automatic download didn't work, download the model manually:

### Option 1: Using wget

```bash
wget -O public/models/model.onnx https://huggingface.co/wambugu71/crop_leaf_diseases_vit_onnx/resolve/main/model.onnx
```

### Option 2: Using curl

```bash
curl -L -o public/models/model.onnx https://huggingface.co/wambugu71/crop_leaf_diseases_vit_onnx/resolve/main/model.onnx
```

### Option 3: Browser Download

1. Visit: https://huggingface.co/wambugu71/crop_leaf_diseases_vit_onnx/tree/main
2. Click on `model.onnx` file
3. Click the download button
4. Move the downloaded file to `public/models/model.onnx` in your project directory

## Model Information

- **Model Name**: crop_leaf_diseases_vit (ONNX version)
- **Model Type**: Vision Transformer (ViT)
- **File Size**: ~84 MB
- **Input Size**: 224x224 RGB images
- **Output**: 12 disease classes for corn, potato, rice, and wheat

### Supported Disease Classes

The model can detect the following conditions:

**Corn:**
- Corn Common Rust
- Corn Gray Leaf Spot
- Healthy Corn

**Potato:**
- Potato Early Blight
- Potato Late Blight
- Healthy Potato

**Rice:**
- Rice Brown Spot
- Rice Leaf Blast
- Healthy Rice

**Wheat:**
- Wheat Brown Rust
- Wheat Yellow Rust
- Healthy Wheat

## Troubleshooting

### Model file is too small (< 1 MB)

This usually means the download was redirected or failed. Delete the file and try again:

```bash
rm public/models/model.onnx
curl -L -o public/models/model.onnx https://huggingface.co/wambugu71/crop_leaf_diseases_vit_onnx/resolve/main/model.onnx
```

### Model fails to load in browser

1. Check browser console for error messages
2. Verify the file size is correct (~84 MB)
3. Try clearing browser cache
4. Ensure you're using a modern browser with WebAssembly support

### Download is very slow

The model is 84 MB, so download time depends on your internet connection. On a typical connection:
- Fast (50+ Mbps): 10-30 seconds
- Medium (10-50 Mbps): 1-2 minutes
- Slow (< 10 Mbps): 3-5 minutes

## Next Steps

After the model is downloaded:

1. Start the development server: `npm run dev`
2. Open http://localhost:3000
3. Upload a crop image to test the detection
4. Check browser console for model loading confirmation

## Additional Resources

- [Hugging Face Model Page](https://huggingface.co/wambugu71/crop_leaf_diseases_vit_onnx)
- [ONNX Runtime Web Documentation](https://onnxruntime.ai/docs/tutorials/web/)
- [Original Model (PyTorch)](https://huggingface.co/wambugu71/crop_leaf_diseases_vit)

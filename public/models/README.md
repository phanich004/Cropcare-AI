# Crop Disease Detection - Model Files

This directory should contain your trained TensorFlow.js model files.

## Required Files

1. **model.json** - The model architecture and metadata
2. **weights.bin** (or multiple weight files) - The trained model weights

## How to Add Your Model

### If you have a TensorFlow/Keras model:

1. Convert your model to TensorFlow.js format:
   ```bash
   pip install tensorflowjs
   tensorflowjs_converter --input_format keras \
     path/to/your/model.h5 \
     public/models/
   ```

2. The converter will generate `model.json` and weight files in this directory.

### If you already have a TensorFlow.js model:

1. Copy `model.json` to this directory
2. Copy all weight files (e.g., `group1-shard1of1.bin`) to this directory

## Model Input Requirements

The current implementation expects:
- Input size: 224x224 pixels
- Color channels: RGB (3 channels)
- Normalization: Values scaled to [0, 1]

If your model uses different input specifications, update the `preprocessImage` function in `pages/index.js`.

## Disease Classes

Update the `diseaseClasses` array in `pages/index.js` to match your model's output classes. The array should contain objects with:
- `name`: Disease name
- `description`: Brief description of the disease
- `treatment`: Recommended treatment

## Testing

Once you've added your model files, the application will automatically load them when you start the development server.

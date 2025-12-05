#!/usr/bin/env python3
"""
Convert wambugu71/crop_leaf_diseases_vit to ONNX format for Transformers.js

This script downloads the PyTorch model from Hugging Face and converts it to ONNX format
that can be used with @xenova/transformers in the browser.

Requirements:
    pip install transformers torch onnx optimum[exporters]

Usage:
    python convert_model_to_onnx.py
"""

import os
import sys
from pathlib import Path

def check_dependencies():
    """Check if required packages are installed"""
    required = ['transformers', 'torch', 'onnx', 'optimum']
    missing = []
    
    for package in required:
        try:
            __import__(package)
        except ImportError:
            missing.append(package)
    
    if missing:
        print("❌ Missing required packages:")
        for pkg in missing:
            print(f"   - {pkg}")
        print("\n📦 Install with:")
        print("   pip install transformers torch onnx optimum[exporters]")
        sys.exit(1)
    
    print("✅ All dependencies installed\n")

def convert_model():
    """Convert the model to ONNX format"""
    from transformers import AutoImageProcessor
    from optimum.onnxruntime import ORTModelForImageClassification
    
    model_id = "wambugu71/crop_leaf_diseases_vit"
    output_dir = "./crop_disease_model_onnx"
    
    print(f"🔄 Converting {model_id} to ONNX format...")
    print(f"📁 Output directory: {output_dir}\n")
    
    try:
        # Create output directory
        Path(output_dir).mkdir(exist_ok=True)
        
        # Load and convert model in one step
        print("1️⃣  Loading and converting model from Hugging Face...")
        print("   This will download the model and convert to ONNX...")
        print("   May take 5-10 minutes on first run...\n")
        
        ort_model = ORTModelForImageClassification.from_pretrained(
            model_id,
            export=True  # This triggers the conversion
        )
        
        print("✅ Model loaded and converted successfully\n")
        
        # Save the ONNX model
        print("2️⃣  Saving ONNX model...")
        ort_model.save_pretrained(output_dir)
        print("✅ ONNX model saved\n")
        
        # Load and save processor
        print("3️⃣  Saving preprocessor config...")
        processor = AutoImageProcessor.from_pretrained(model_id)
        processor.save_pretrained(output_dir)
        print("✅ Preprocessor saved\n")
        
        # Verify files
        print("4️⃣  Verifying exported files...")
        required_files = ['model.onnx', 'config.json', 'preprocessor_config.json']
        
        for file in required_files:
            file_path = Path(output_dir) / file
            if file_path.exists():
                size = file_path.stat().st_size / (1024 * 1024)  # MB
                print(f"   ✅ {file} ({size:.2f} MB)")
            else:
                print(f"   ❌ {file} - MISSING!")
        
        print("\n" + "="*60)
        print("🎉 SUCCESS! Model converted to ONNX format")
        print("="*60)
        
        print("\n📋 Next Steps:")
        print("\n1. Upload to Hugging Face (recommended):")
        print("   - Create a new model repository on huggingface.co")
        print("   - Upload all files from ./crop_disease_model_onnx/")
        print("   - Update lib/modelUtils.js to use your model:")
        print("     'YOUR_USERNAME/crop_disease_model_onnx'")
        
        print("\n2. OR use locally (for testing):")
        print("   - Copy files to public/models/ directory")
        print("   - Configure Transformers.js to use local models")
        
        print("\n3. Test the model:")
        print("   - Restart your dev server")
        print("   - Upload a crop image")
        print("   - Check browser console for loading messages")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error during conversion: {e}")
        print("\n🔍 Troubleshooting:")
        print("   - Make sure you have internet connection")
        print("   - Try: pip install --upgrade transformers optimum")
        print("   - Check if model exists: https://huggingface.co/wambugu71/crop_leaf_diseases_vit")
        return False

def main():
    print("="*60)
    print("  Crop Disease Model Converter")
    print("  Converting to ONNX for Transformers.js")
    print("="*60)
    print()
    
    # Check dependencies
    check_dependencies()
    
    # Convert model
    success = convert_model()
    
    if success:
        print("\n✨ Conversion complete! Check the output directory.")
        sys.exit(0)
    else:
        print("\n💥 Conversion failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()

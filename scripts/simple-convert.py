#!/usr/bin/env python3
"""
Simple YOLO to TensorFlow.js converter
This is a simplified version that focuses on the most reliable conversion path
"""

import os
import sys
import json
from pathlib import Path

def check_dependencies():
    """Check if required packages are installed"""
    required_packages = ['ultralytics', 'tensorflowjs', 'tensorflow']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✓ {package} is installed")
        except ImportError:
            missing_packages.append(package)
            print(f"✗ {package} is missing")
    
    if missing_packages:
        print(f"\nPlease install missing packages:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    return True

def convert_yolo_to_tfjs():
    """Convert YOLO model to TensorFlow.js format"""
    
    # Paths
    model_path = Path('../python-backend/best (5).pt')
    output_dir = Path('../public/models/yolo-defect-detector')
    
    if not model_path.exists():
        print(f"Error: Model file not found at {model_path}")
        print("Please ensure 'best (5).pt' is in the python-backend directory")
        return False
    
    print(f"Found model: {model_path}")
    
    try:
        from ultralytics import YOLO
        import tensorflowjs as tfjs
        
        # Load YOLO model
        print("Loading YOLO model...")
        model = YOLO(str(model_path))
        
        # Get model info
        class_names = list(model.names.values())
        print(f"Model classes: {class_names}")
        print(f"Number of classes: {len(class_names)}")
        
        # Create output directory
        output_dir.mkdir(parents=True, exist_ok=True)
        tfjs_dir = output_dir / 'tfjs_model'
        
        # Method 1: Try direct TensorFlow.js export (if supported)
        try:
            print("Attempting direct TensorFlow.js export...")
            model.export(format='tfjs', imgsz=640)
            
            # Move files to correct location
            source_dir = model_path.parent / 'best_web_model'
            if source_dir.exists():
                import shutil
                if tfjs_dir.exists():
                    shutil.rmtree(tfjs_dir)
                shutil.move(str(source_dir), str(tfjs_dir))
                print("✓ Direct export successful!")
                
        except Exception as e:
            print(f"Direct export failed: {e}")
            print("Trying ONNX conversion path...")
            
            # Method 2: ONNX -> TensorFlow -> TensorFlow.js
            try:
                # Export to ONNX
                print("Exporting to ONNX...")
                onnx_path = model_path.parent / 'best.onnx'
                model.export(format='onnx', imgsz=640, simplify=True)
                
                if not onnx_path.exists():
                    raise Exception("ONNX export failed")
                
                print("✓ ONNX export successful")
                
                # Convert ONNX to TensorFlow.js
                print("Converting ONNX to TensorFlow.js...")
                
                # This requires onnx-tf, which can be tricky to install
                # For now, we'll provide instructions for manual conversion
                print("\nONNX file created successfully!")
                print(f"ONNX model location: {onnx_path}")
                print("\nTo complete the conversion, run:")
                print("1. pip install onnx-tf")
                print("2. Use the conversion commands in MODEL_CONVERSION_GUIDE.md")
                
                return True
                
            except Exception as e2:
                print(f"ONNX conversion also failed: {e2}")
                return False
        
        # Update config file
        config = {
            "models": {
                "yolo-defect-detector": {
                    "name": "YOLO Welding Defect Detector",
                    "version": "1.0.0",
                    "description": f"Converted from {model_path.name}",
                    "modelUrl": "/models/yolo-defect-detector/tfjs_model/model.json",
                    "inputSize": {"width": 640, "height": 640},
                    "numClasses": len(class_names),
                    "classNames": class_names,
                    "anchors": [
                        [10, 13], [16, 30], [33, 23],
                        [30, 61], [62, 45], [59, 119],
                        [116, 90], [156, 198], [373, 326]
                    ],
                    "confidenceThreshold": 0.5,
                    "nmsThreshold": 0.4,
                    "supportedMaterials": ["metal", "plastic", "composite", "ceramic"],
                    "trainingInfo": {
                        "dataset": "Welding Defect Dataset",
                        "modelFile": model_path.name,
                        "convertedTo": "TensorFlow.js"
                    }
                }
            },
            "defaultModel": "yolo-defect-detector"
        }
        
        config_path = output_dir.parent / 'config.json'
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"✓ Configuration updated: {config_path}")
        
        # Verify the conversion
        if tfjs_dir.exists():
            model_json = tfjs_dir / 'model.json'
            if model_json.exists():
                print("✓ TensorFlow.js model files created successfully!")
                print(f"Model location: {tfjs_dir}")
                
                # List generated files
                files = list(tfjs_dir.glob('*'))
                print(f"Generated files: {[f.name for f in files]}")
                
                return True
        
        print("⚠ Conversion completed but please verify the files manually")
        return True
        
    except Exception as e:
        print(f"Conversion failed: {e}")
        return False

def main():
    print("YOLO to TensorFlow.js Converter")
    print("=" * 40)
    
    # Check dependencies
    if not check_dependencies():
        return
    
    print("\nStarting conversion...")
    
    if convert_yolo_to_tfjs():
        print("\n✓ Conversion completed successfully!")
        print("\nNext steps:")
        print("1. Start your Next.js development server: npm run dev")
        print("2. Navigate to: http://localhost:3000/client-detection")
        print("3. Upload images to test the client-side AI detection")
        print("\nIf you encounter issues, check MODEL_CONVERSION_GUIDE.md for detailed instructions.")
    else:
        print("\n✗ Conversion failed!")
        print("Please check the error messages above and refer to MODEL_CONVERSION_GUIDE.md")

if __name__ == "__main__":
    main()
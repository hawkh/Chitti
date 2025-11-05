#!/usr/bin/env python3
"""
Convert YOLO PyTorch model to TensorFlow.js format
This script converts the best (5).pt model to TensorFlow.js format for web deployment
"""

import torch
import tensorflowjs as tfjs
from ultralytics import YOLO
import tensorflow as tf
import numpy as np
import os
import json

def convert_yolo_to_tfjs(model_path, output_dir):
    """
    Convert YOLO PyTorch model to TensorFlow.js format
    
    Args:
        model_path (str): Path to the .pt model file
        output_dir (str): Output directory for TensorFlow.js model
    """
    
    print(f"Loading YOLO model from {model_path}")
    
    # Load the YOLO model
    model = YOLO(model_path)
    
    # Get model info
    model_info = {
        'input_size': [640, 640],
        'num_classes': len(model.names),
        'class_names': list(model.names.values()),
        'confidence_threshold': 0.5,
        'iou_threshold': 0.45
    }
    
    print(f"Model info: {model_info}")
    
    # Export to ONNX first (intermediate step)
    onnx_path = os.path.join(output_dir, 'model.onnx')
    model.export(format='onnx', imgsz=640, simplify=True)
    
    # Convert ONNX to TensorFlow
    import onnx
    import onnx_tf
    
    onnx_model = onnx.load(onnx_path)
    tf_rep = onnx_tf.backend.prepare(onnx_model)
    
    # Save as TensorFlow SavedModel
    saved_model_dir = os.path.join(output_dir, 'saved_model')
    tf_rep.export_graph(saved_model_dir)
    
    # Convert to TensorFlow.js
    tfjs_dir = os.path.join(output_dir, 'tfjs_model')
    tfjs.converters.convert_tf_saved_model(
        saved_model_dir,
        tfjs_dir,
        quantization_bytes=2,  # Quantize to reduce size
        skip_op_check=True
    )
    
    # Save model configuration
    config = {
        'modelUrl': './tfjs_model/model.json',
        'inputSize': {'width': 640, 'height': 640},
        'numClasses': model_info['num_classes'],
        'classNames': model_info['class_names'],
        'confidenceThreshold': model_info['confidence_threshold'],
        'nmsThreshold': model_info['iou_threshold'],
        'anchors': [
            [10, 13], [16, 30], [33, 23],
            [30, 61], [62, 45], [59, 119],
            [116, 90], [156, 198], [373, 326]
        ]
    }
    
    config_path = os.path.join(output_dir, 'config.json')
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"Model converted successfully!")
    print(f"TensorFlow.js model: {tfjs_dir}")
    print(f"Configuration: {config_path}")
    
    return tfjs_dir, config_path

def main():
    # Paths
    model_path = '../python-backend/best (5).pt'
    output_dir = '../public/models/yolo-defect-detector'
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Convert model
    try:
        tfjs_dir, config_path = convert_yolo_to_tfjs(model_path, output_dir)
        print("Conversion completed successfully!")
        
        # Verify the conversion
        print("\nVerifying converted model...")
        model_files = os.listdir(tfjs_dir)
        print(f"Generated files: {model_files}")
        
        # Check if model.json exists
        model_json_path = os.path.join(tfjs_dir, 'model.json')
        if os.path.exists(model_json_path):
            print("✓ model.json created")
            with open(model_json_path, 'r') as f:
                model_json = json.load(f)
                print(f"  - Format: {model_json.get('format', 'unknown')}")
                print(f"  - Weights manifest: {len(model_json.get('weightsManifest', []))} entries")
        
        # Check for weight files
        weight_files = [f for f in model_files if f.endswith('.bin')]
        print(f"✓ {len(weight_files)} weight shard files created")
        
    except Exception as e:
        print(f"Error during conversion: {e}")
        print("Make sure you have the required dependencies:")
        print("pip install tensorflowjs onnx onnx-tf ultralytics")

if __name__ == "__main__":
    main()
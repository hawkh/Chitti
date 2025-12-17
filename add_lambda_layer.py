"""
Add PyTorch + Ultralytics layer to Lambda function
Uses public Lambda layers for PyTorch
"""

import boto3

REGION = "us-east-1"
FUNCTION_NAME = "yolo-defect-detector"

# Public PyTorch Lambda Layer ARNs (maintained by AWS community)
# These are pre-built layers with PyTorch, torchvision, PIL, numpy, etc.
PYTORCH_LAYER_ARN = "arn:aws:lambda:us-east-1:770693421928:layer:Klayers-p311-torch:11"
PILLOW_LAYER_ARN = "arn:aws:lambda:us-east-1:770693421928:layer:Klayers-p311-Pillow:11"

def add_layers():
    """Add PyTorch layers to Lambda function"""
    lambda_client = boto3.client('lambda', region_name=REGION)
    
    try:
        print(f"Adding layers to {FUNCTION_NAME}...")
        
        # Get current function configuration
        response = lambda_client.get_function_configuration(FunctionName=FUNCTION_NAME)
        current_layers = response.get('Layers', [])
        
        # Add new layers
        layer_arns = [PYTORCH_LAYER_ARN, PILLOW_LAYER_ARN]
        
        # Update function configuration
        lambda_client.update_function_configuration(
            FunctionName=FUNCTION_NAME,
            Layers=layer_arns,
            Timeout=300,
            MemorySize=10240,  # Max memory for faster processing
            EphemeralStorage={'Size': 10240}  # 10GB storage for model
        )
        
        print("✅ Layers added successfully!")
        print(f"   - PyTorch Layer: {PYTORCH_LAYER_ARN}")
        print(f"   - Pillow Layer: {PILLOW_LAYER_ARN}")
        print("\n⚠️  Note: Lambda layers might not have ultralytics")
        print("   We'll need to package ultralytics separately")
        
    except Exception as e:
        print(f"❌ Error adding layers: {e}")
        print("\n💡 Alternative: Use Docker container image instead")
        print("   This allows full control over dependencies")


if __name__ == "__main__":
    add_layers()

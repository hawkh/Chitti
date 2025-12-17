"""
Deploy YOLO model to AWS Lambda + S3
Model stored in S3, Lambda downloads on cold start
"""

import boto3
import json
import zipfile
import os
import subprocess

# AWS Configuration
REGION = "us-east-1"
FUNCTION_NAME = "yolo-defect-detector"
ROLE_NAME = "lambda-yolo-role"
S3_BUCKET = "chitti-yolo-models"
MODEL_FILE = "best (5).pt"

def create_s3_bucket():
    """Create S3 bucket for model storage"""
    s3 = boto3.client('s3', region_name=REGION)
    
    try:
        print(f"Creating S3 bucket: {S3_BUCKET}")
        s3.create_bucket(Bucket=S3_BUCKET)
        print("✅ S3 bucket created")
    except s3.exceptions.BucketAlreadyOwnedByYou:
        print("✅ S3 bucket already exists")
    except Exception as e:
        print(f"❌ Error creating bucket: {e}")
        return False
    
    return True


def upload_model_to_s3():
    """Upload YOLO model to S3"""
    s3 = boto3.client('s3', region_name=REGION)
    
    if not os.path.exists(MODEL_FILE):
        print(f"❌ Model file not found: {MODEL_FILE}")
        return False
    
    print(f"Uploading {MODEL_FILE} to S3...")
    try:
        s3.upload_file(MODEL_FILE, S3_BUCKET, "best.pt")
        print("✅ Model uploaded to S3")
        return True
    except Exception as e:
        print(f"❌ Error uploading model: {e}")
        return False


def create_iam_role():
    """Create IAM role for Lambda"""
    iam = boto3.client('iam', region_name=REGION)
    
    trust_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"Service": "lambda.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }
        ]
    }
    
    try:
        print(f"Creating IAM role: {ROLE_NAME}")
        response = iam.create_role(
            RoleName=ROLE_NAME,
            AssumeRolePolicyDocument=json.dumps(trust_policy),
            Description="Role for YOLO Lambda function"
        )
        role_arn = response['Role']['Arn']
        print(f"✅ IAM role created: {role_arn}")
        
        # Attach policies
        iam.attach_role_policy(
            RoleName=ROLE_NAME,
            PolicyArn="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        )
        
        # Add S3 read policy
        s3_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": ["s3:GetObject"],
                    "Resource": f"arn:aws:s3:::{S3_BUCKET}/*"
                }
            ]
        }
        
        iam.put_role_policy(
            RoleName=ROLE_NAME,
            PolicyName="S3ReadPolicy",
            PolicyDocument=json.dumps(s3_policy)
        )
        
        print("✅ Policies attached")
        return role_arn
        
    except iam.exceptions.EntityAlreadyExistsException:
        print("✅ IAM role already exists")
        response = iam.get_role(RoleName=ROLE_NAME)
        return response['Role']['Arn']
    except Exception as e:
        print(f"❌ Error creating IAM role: {e}")
        return None


def create_lambda_function(role_arn):
    """Create Lambda function"""
    lambda_client = boto3.client('lambda', region_name=REGION)
    
    # Create deployment package
    print("Creating Lambda deployment package...")
    
    lambda_code = f"""
import json
import boto3
import os
import tempfile
from urllib.parse import unquote_plus

# Download model from S3 on cold start
s3 = boto3.client('s3')
MODEL_PATH = '/tmp/best.pt'
S3_BUCKET = '{S3_BUCKET}'

def download_model():
    if not os.path.exists(MODEL_PATH):
        print('Downloading model from S3...')
        s3.download_file(S3_BUCKET, 'best.pt', MODEL_PATH)
        print('✅ Model downloaded')

# Global model instance
model = None

def load_model():
    global model
    if model is None:
        download_model()
        try:
            from ultralytics import YOLO
            print('Loading YOLO model...')
            model = YOLO(MODEL_PATH)
            print('✅ Model loaded')
        except Exception as e:
            print(f'❌ Error loading model: {{e}}')
    return model

def lambda_handler(event, context):
    try:
        # Parse request
        body = json.loads(event.get('body', '{{}}'))
        image_data = body.get('image', '')
        
        if not image_data:
            return {{
                'statusCode': 400,
                'headers': {{'Access-Control-Allow-Origin': '*'}},
                'body': json.dumps({{'error': 'No image provided'}})
            }}
        
        # Load model
        yolo_model = load_model()
        if yolo_model is None:
            return {{
                'statusCode': 503,
                'headers': {{'Access-Control-Allow-Origin': '*'}},
                'body': json.dumps({{'error': 'Model not available'}})
            }}
        
        # Decode image
        import base64
        import io
        from PIL import Image
        
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Run inference
        results = yolo_model(image, conf=0.20, iou=0.45, verbose=False)
        
        # Process results
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                
                class_names = ['Bad Weld', 'Good Weld', 'Defect']
                class_name = class_names[cls] if cls < len(class_names) else f'Class {{cls}}'
                
                detections.append({{
                    'bbox': [float(x1), float(y1), float(x2 - x1), float(y2 - y1)],
                    'confidence': conf,
                    'class_id': cls,
                    'class_name': class_name
                }})
        
        return {{
            'statusCode': 200,
            'headers': {{'Access-Control-Allow-Origin': '*'}},
            'body': json.dumps({{
                'success': True,
                'detections': detections,
                'num_detections': len(detections)
            }})
        }}
        
    except Exception as e:
        import traceback
        print(f'❌ Error: {{e}}')
        traceback.print_exc()
        
        return {{
            'statusCode': 500,
            'headers': {{'Access-Control-Allow-Origin': '*'}},
            'body': json.dumps({{'error': str(e)}})
        }}
"""
    
    # Write lambda function
    with open('lambda_function.py', 'w', encoding='utf-8') as f:
        f.write(lambda_code)
    
    # Create zip file
    with zipfile.ZipFile('lambda_package.zip', 'w') as zipf:
        zipf.write('lambda_function.py')
    
    # Read zip file
    with open('lambda_package.zip', 'rb') as f:
        zip_content = f.read()
    
    try:
        print(f"Creating Lambda function: {FUNCTION_NAME}")
        response = lambda_client.create_function(
            FunctionName=FUNCTION_NAME,
            Runtime='python3.11',
            Role=role_arn,
            Handler='lambda_function.lambda_handler',
            Code={'ZipFile': zip_content},
            Timeout=300,
            MemorySize=3008,
            Environment={
                'Variables': {
                    'S3_BUCKET': S3_BUCKET
                }
            }
        )
        
        function_arn = response['FunctionArn']
        print(f"✅ Lambda function created: {function_arn}")
        
        # Create function URL
        url_response = lambda_client.create_function_url_config(
            FunctionName=FUNCTION_NAME,
            AuthType='NONE',
            Cors={
                'AllowOrigins': ['*'],
                'AllowMethods': ['POST', 'GET'],
                'AllowHeaders': ['*'],
                'MaxAge': 86400
            }
        )
        
        function_url = url_response['FunctionUrl']
        print(f"✅ Function URL: {function_url}")
        
        return function_url
        
    except lambda_client.exceptions.ResourceConflictException:
        print("✅ Lambda function already exists")
        response = lambda_client.get_function_url_config(FunctionName=FUNCTION_NAME)
        return response['FunctionUrl']
    except Exception as e:
        print(f"❌ Error creating Lambda function: {e}")
        return None


def main():
    print("🚀 Deploying YOLO to AWS Lambda + S3")
    print("=" * 50)
    
    # Step 1: Create S3 bucket
    if not create_s3_bucket():
        return
    
    # Step 2: Upload model to S3
    if not upload_model_to_s3():
        return
    
    # Step 3: Create IAM role
    role_arn = create_iam_role()
    if not role_arn:
        return
    
    # Wait for role to propagate
    print("⏳ Waiting for IAM role to propagate (10 seconds)...")
    import time
    time.sleep(10)
    
    # Step 4: Create Lambda function
    function_url = create_lambda_function(role_arn)
    if not function_url:
        return
    
    print("\n" + "=" * 50)
    print("✅ DEPLOYMENT COMPLETE!")
    print("=" * 50)
    print(f"\n🌐 Your API endpoint:")
    print(f"   {function_url}")
    print(f"\n📝 Add this to your .env.local:")
    print(f"   NEXT_PUBLIC_YOLO_API_URL={function_url}")
    print("\n⚠️  Note: First request will be slow (cold start + model download)")
    print("   Subsequent requests will be fast (model cached in /tmp)")


if __name__ == "__main__":
    main()

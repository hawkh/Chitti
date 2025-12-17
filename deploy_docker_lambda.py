"""
Deploy YOUR YOLO model to AWS Lambda using Docker container
This will work with YOUR model and full PyTorch support!
"""

import boto3
import subprocess
import time
import os

REGION = "us-east-1"
ACCOUNT_ID = "839690183659"
FUNCTION_NAME = "yolo-defect-detector"
IMAGE_NAME = "yolo-lambda"
ECR_REPO_NAME = "yolo-defect-detector"

print("🚀 Deploying YOUR YOLO model to Lambda with Docker!")
print("=" * 60)

# Step 1: Create ECR repository
print("\n📦 Step 1: Creating ECR repository...")
ecr_client = boto3.client('ecr', region_name=REGION)

try:
    response = ecr_client.create_repository(
        repositoryName=ECR_REPO_NAME,
        imageScanningConfiguration={'scanOnPush': True}
    )
    repo_uri = response['repository']['repositoryUri']
    print(f"✅ ECR repository created: {repo_uri}")
except ecr_client.exceptions.RepositoryAlreadyExistsException:
    response = ecr_client.describe_repositories(repositoryNames=[ECR_REPO_NAME])
    repo_uri = response['repositories'][0]['repositoryUri']
    print(f"✅ ECR repository exists: {repo_uri}")

# Step 2: Get ECR login
print("\n🔐 Step 2: Logging into ECR...")
try:
    result = subprocess.run(
        f'aws ecr get-login-password --region {REGION} | docker login --username AWS --password-stdin {ACCOUNT_ID}.dkr.ecr.{REGION}.amazonaws.com',
        shell=True,
        capture_output=True,
        text=True
    )
    if result.returncode == 0:
        print("✅ Logged into ECR")
    else:
        print(f"❌ ECR login failed: {result.stderr}")
        print("\n💡 Make sure Docker Desktop is running!")
        exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n💡 Make sure Docker Desktop is running!")
    exit(1)

# Step 3: Build Docker image
print("\n🏗️  Step 3: Building Docker image with YOUR model...")
print("   This will take 5-10 minutes (downloading PyTorch, etc.)")

# Copy model to lambda directory
import shutil
model_src = "best (5).pt"
model_dst = "lambda/yolo-detector/best.pt"

if os.path.exists(model_src):
    print(f"📋 Copying YOUR model: {model_src} -> {model_dst}")
    shutil.copy(model_src, model_dst)
    print(f"✅ Model copied: {os.path.getsize(model_dst)} bytes")
else:
    print(f"⚠️  Model file not found: {model_src}")
    print("   Will download from S3 instead")

try:
    result = subprocess.run(
        f'docker build -t {IMAGE_NAME} lambda/yolo-detector/',
        shell=True,
        capture_output=False,  # Show output
        text=True
    )
    if result.returncode == 0:
        print("✅ Docker image built successfully!")
    else:
        print(f"❌ Docker build failed")
        exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

# Step 4: Tag image
print(f"\n🏷️  Step 4: Tagging image...")
image_uri = f"{repo_uri}:latest"
try:
    result = subprocess.run(
        f'docker tag {IMAGE_NAME}:latest {image_uri}',
        shell=True,
        capture_output=True,
        text=True
    )
    if result.returncode == 0:
        print(f"✅ Image tagged: {image_uri}")
    else:
        print(f"❌ Tagging failed: {result.stderr}")
        exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

# Step 5: Push to ECR
print(f"\n⬆️  Step 5: Pushing image to ECR...")
print("   This will take 2-5 minutes (uploading ~2GB image)")
try:
    result = subprocess.run(
        f'docker push {image_uri}',
        shell=True,
        capture_output=False,  # Show progress
        text=True
    )
    if result.returncode == 0:
        print("✅ Image pushed to ECR!")
    else:
        print(f"❌ Push failed")
        exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

# Step 6: Update Lambda to use container image
print(f"\n🔄 Step 6: Updating Lambda function to use YOUR model...")
lambda_client = boto3.client('lambda', region_name=REGION)

try:
    # Wait for any pending updates
    print("⏳ Waiting for Lambda to be ready...")
    time.sleep(10)
    
    response = lambda_client.update_function_code(
        FunctionName=FUNCTION_NAME,
        ImageUri=image_uri
    )
    print(f"✅ Lambda function updated!")
    print(f"   Function ARN: {response['FunctionArn']}")
    print(f"   Image URI: {image_uri}")
    
    # Wait for update to complete
    print("⏳ Waiting for update to complete...")
    waiter = lambda_client.get_waiter('function_updated')
    waiter.wait(FunctionName=FUNCTION_NAME)
    
    # Update configuration
    print("⚙️  Updating configuration...")
    lambda_client.update_function_configuration(
        FunctionName=FUNCTION_NAME,
        Timeout=300,
        MemorySize=10240,
        EphemeralStorage={'Size': 10240}
    )
    
    print("✅ Configuration updated!")
    
except Exception as e:
    print(f"❌ Failed to update Lambda: {e}")
    exit(1)

print("\n" + "=" * 60)
print("🎉 DEPLOYMENT COMPLETE!")
print("=" * 60)
print(f"\n✅ YOUR YOLO model is now running on Lambda!")
print(f"✅ Full PyTorch + Ultralytics support")
print(f"✅ Model: best (5).pt (YOUR trained model)")
print(f"\n🌐 Test your API:")
print(f"   https://vimr4uemw3ft4b4t3edqocw6ni0iuxpu.lambda-url.us-east-1.on.aws/")
print(f"\n📝 Test command:")
print(f"   python test_lambda.py")
print("\n⚠️  First request will be slow (10-30s cold start)")
print("   Subsequent requests will be fast (2-5s)")

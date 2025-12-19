@echo off
echo ========================================
echo 🚀 Deploy Updated Backend to AWS ECS
echo ========================================
echo.

set AWS_REGION=us-east-1
set ECR_REPO_NAME=chitti-ai-backend
set ECS_CLUSTER=chitti-ai-cluster
set ECS_SERVICE=chitti-ai-backend-service

REM Get AWS Account ID
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text 2^>nul') do set AWS_ACCOUNT_ID=%%i

if "%AWS_ACCOUNT_ID%"=="" (
    echo ❌ Error: AWS CLI not configured
    echo Run: aws configure
    pause
    exit /b 1
)

echo ✅ AWS Account: %AWS_ACCOUNT_ID%
echo.

REM Step 1: Build and Push Docker Image
echo ========================================
echo 📦 Step 1: Building Docker Image
echo ========================================
echo.

cd python-backend

echo Logging into ECR...
aws ecr get-login-password --region %AWS_REGION% | docker login --username AWS --password-stdin %AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com

echo.
echo Building Docker image...
docker build -t %ECR_REPO_NAME% .

if errorlevel 1 (
    echo ❌ Docker build failed
    cd ..
    pause
    exit /b 1
)

echo.
echo Tagging image...
docker tag %ECR_REPO_NAME%:latest %AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com/%ECR_REPO_NAME%:latest

echo.
echo Pushing to ECR...
docker push %AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com/%ECR_REPO_NAME%:latest

if errorlevel 1 (
    echo ❌ Docker push failed
    cd ..
    pause
    exit /b 1
)

cd ..
echo ✅ Image pushed to ECR
echo.

REM Step 2: Update ECS Service
echo ========================================
echo 🔄 Step 2: Updating ECS Service
echo ========================================
echo.

echo Forcing new deployment...
aws ecs update-service ^
    --cluster %ECS_CLUSTER% ^
    --service %ECS_SERVICE% ^
    --force-new-deployment ^
    --region %AWS_REGION% >nul

if errorlevel 1 (
    echo ❌ Failed to update service
    echo.
    echo Make sure ECS service exists. Run DEPLOY_TO_ECS.bat first.
    pause
    exit /b 1
)

echo ✅ Deployment triggered
echo.

REM Step 3: Wait for Deployment
echo ========================================
echo ⏳ Step 3: Waiting for Deployment
echo ========================================
echo.
echo This may take 2-3 minutes...
echo.

aws ecs wait services-stable --cluster %ECS_CLUSTER% --services %ECS_SERVICE% --region %AWS_REGION%

echo.
echo ========================================
echo ✅ DEPLOYMENT COMPLETE!
echo ========================================
echo.

REM Get Public IP
for /f "tokens=*" %%i in ('aws ecs list-tasks --cluster %ECS_CLUSTER% --service-name %ECS_SERVICE% --region %AWS_REGION% --query "taskArns[0]" --output text') do set TASK_ARN=%%i

if not "%TASK_ARN%"=="None" (
    for /f "tokens=*" %%i in ('aws ecs describe-tasks --cluster %ECS_CLUSTER% --tasks %TASK_ARN% --region %AWS_REGION% --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text') do set ENI_ID=%%i
    
    if not "%ENI_ID%"=="" (
        for /f "tokens=*" %%i in ('aws ec2 describe-network-interfaces --network-interface-ids %ENI_ID% --region %AWS_REGION% --query "NetworkInterfaces[0].Association.PublicIp" --output text') do set PUBLIC_IP=%%i
        
        if not "%PUBLIC_IP%"=="None" (
            echo 🌐 Backend URL: http://%PUBLIC_IP%:10000
            echo.
            echo 🧪 Test it:
            echo    curl http://%PUBLIC_IP%:10000/health
            echo.
            echo 📝 Update your .env.local:
            echo    NEXT_PUBLIC_WELD_API_URL=http://%PUBLIC_IP%:10000
            echo.
        )
    )
)

echo 📊 View in AWS Console:
echo https://%AWS_REGION%.console.aws.amazon.com/ecs/v2/clusters/%ECS_CLUSTER%/services/%ECS_SERVICE%
echo.

pause

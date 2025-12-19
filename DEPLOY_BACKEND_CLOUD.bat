@echo off
echo ========================================
echo 🚀 Deploy Backend via AWS Cloud Build
echo ========================================
echo.

set AWS_REGION=us-east-1
set CODEBUILD_PROJECT=chitti-backend-build
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

REM Step 1: Trigger Cloud Build
echo ========================================
echo 📦 Step 1: Triggering Cloud Build
echo ========================================
echo.

echo Starting build in AWS CodeBuild...
for /f "tokens=*" %%i in ('aws codebuild start-build --project-name %CODEBUILD_PROJECT% --region %AWS_REGION% --query "build.id" --output text') do set BUILD_ID=%%i

if "%BUILD_ID%"=="" (
    echo ❌ Failed to start build
    echo.
    echo Make sure CodeBuild project exists. Run DEPLOY_ECR_CLOUD_BUILD.bat first.
    pause
    exit /b 1
)

echo ✅ Build started: %BUILD_ID%
echo.
echo 📊 Monitor at:
echo https://%AWS_REGION%.console.aws.amazon.com/codesuite/codebuild/projects/%CODEBUILD_PROJECT%/build/%BUILD_ID%/log
echo.
echo Waiting for build to complete...
echo.

:WAIT_LOOP
timeout /t 15 /nobreak >nul
for /f "tokens=*" %%i in ('aws codebuild batch-get-builds --ids %BUILD_ID% --region %AWS_REGION% --query "builds[0].buildStatus" --output text') do set BUILD_STATUS=%%i

if "%BUILD_STATUS%"=="IN_PROGRESS" (
    echo [%time%] Status: Building...
    goto WAIT_LOOP
)

echo.
if not "%BUILD_STATUS%"=="SUCCEEDED" (
    echo ❌ BUILD FAILED: %BUILD_STATUS%
    echo Check logs at the URL above
    pause
    exit /b 1
)

echo ✅ Build successful!
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
            echo 📝 Your .env.local already has:
            echo    NEXT_PUBLIC_WELD_API_URL=http://%PUBLIC_IP%:10000
            echo.
            echo ✅ No need to update .env.local - it's already configured!
            echo.
        )
    )
)

echo 📊 View in AWS Console:
echo https://%AWS_REGION%.console.aws.amazon.com/ecs/v2/clusters/%ECS_CLUSTER%/services/%ECS_SERVICE%
echo.
echo 🔄 Restart your Next.js dev server to use the updated backend:
echo    Press Ctrl+C in the terminal running npm run dev
echo    Then run: npm run dev
echo.

pause

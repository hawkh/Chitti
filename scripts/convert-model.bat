@echo off
echo Converting YOLO model to TensorFlow.js format...

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Install required packages
echo Installing required packages...
pip install -r requirements-conversion.txt

REM Run the conversion script
echo Running model conversion...
python convert-model-to-tfjs.py

echo.
echo Conversion completed!
echo The TensorFlow.js model files should now be in ../public/models/yolo-defect-detector/
echo.
pause
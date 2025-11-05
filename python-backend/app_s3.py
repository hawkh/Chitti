from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from s3_fraud_detection import S3FraudDetector
import os

app = FastAPI(title="S3 Fraud Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize detector
detector = S3FraudDetector(
    bucket_name=os.getenv("S3_BUCKET", "your-bucket-name"),
    api_endpoint=os.getenv("API_ENDPOINT", "https://api.example.com/fraud-results")
)

class FraudDetectionRequest(BaseModel):
    s3Uri: str
    userId: str

class FraudDetectionResponse(BaseModel):
    userId: str
    timestamp: str
    isFraud: bool
    status: str

@app.get("/health")
async def health():
    return {"status": "ok", "service": "s3-fraud-detection"}

@app.post("/detect-fraud", response_model=FraudDetectionResponse)
async def detect_fraud(request: FraudDetectionRequest):
    """Process image from S3 and detect fraud"""
    try:
        result = detector.process_image(request.s3Uri, request.userId)
        return {
            "userId": request.userId,
            "timestamp": detector.extract_timestamp_from_uri(request.s3Uri),
            "isFraud": result.get("isFraud", False),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)

# S3 Fraud Detection Integration

## Overview

Complete workflow for fraud detection using S3 images:
1. **S3 Storage**: Images stored in S3
2. **Embedding Generation**: Your implementation
3. **Vector DB Search**: Your similarity search
4. **API Post**: Send results to web team's API

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements_s3.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Run Server
```bash
python app_s3.py
```

## API Usage

### Endpoint
```bash
POST http://localhost:5000/detect-fraud
Content-Type: application/json

{
  "s3Uri": "s3://bucket/path/1234567890_image.jpg",
  "userId": "user123"
}
```

### Response
```json
{
  "userId": "user123",
  "timestamp": "2024-01-15T10:30:00",
  "isFraud": false,
  "status": "success"
}
```

## Implementation Steps

### 1. Implement Embedding Generation
Edit `s3_fraud_detection.py`:
```python
def generate_embeddings(self, image_bytes: bytes) -> list:
    # Your embedding model here
    # Example: Use ResNet, CLIP, or custom model
    return embeddings
```

### 2. Implement Vector DB Search
```python
def similarity_search(self, embeddings: list) -> Dict[str, Any]:
    # Your vector DB query here
    # Example: Pinecone, Weaviate, Milvus
    return {"similarity_score": 0.95, "matches": [...]}
```

### 3. Implement Fraud Detection Logic
```python
def detect_fraud(self, similarity_results: Dict[str, Any]) -> bool:
    # Your fraud detection logic
    threshold = 0.8
    return similarity_results["similarity_score"] > threshold
```

## Timestamp Extraction

The system extracts timestamp from S3 URI patterns:
- `s3://bucket/1234567890_file.jpg` → Unix timestamp
- `s3://bucket/path/1234567890/file.jpg` → Unix timestamp
- Supports both seconds (10 digits) and milliseconds (13 digits)

## AWS Configuration

### Option 1: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1
```

### Option 2: AWS CLI
```bash
aws configure
```

### Option 3: IAM Role (EC2/Lambda)
No configuration needed if running on AWS with IAM role

## Testing

### Test with curl
```bash
curl -X POST http://localhost:5000/detect-fraud \
  -H "Content-Type: application/json" \
  -d '{
    "s3Uri": "s3://my-bucket/images/1705315800_defect.jpg",
    "userId": "user123"
  }'
```

### Test with Python
```python
import requests

response = requests.post(
    "http://localhost:5000/detect-fraud",
    json={
        "s3Uri": "s3://my-bucket/images/1705315800_defect.jpg",
        "userId": "user123"
    }
)
print(response.json())
```

## Integration with Web Team

The system posts results to the API endpoint you configure:

```python
# Payload sent to web team's API
{
  "userId": "user123",
  "timestamp": "2024-01-15T10:30:00",
  "isFraud": false
}
```

Configure the endpoint in `.env`:
```bash
API_ENDPOINT=https://your-api.com/fraud-results
```

## Architecture

```
S3 Image → Download → Generate Embeddings → Vector DB Search → 
Fraud Detection → Post to API → Return Result
```

## Error Handling

The system handles:
- S3 access errors
- Invalid S3 URIs
- Embedding generation failures
- Vector DB connection issues
- API posting failures

## Production Deployment

### Using Docker
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements_s3.txt .
RUN pip install -r requirements_s3.txt
COPY . .
CMD ["uvicorn", "app_s3:app", "--host", "0.0.0.0", "--port", "5000"]
```

### Using Uvicorn
```bash
uvicorn app_s3:app --host 0.0.0.0 --port 5000 --workers 4
```

## Next Steps

1. ✅ Install dependencies
2. ⚠️ Implement `generate_embeddings()`
3. ⚠️ Implement `similarity_search()`
4. ⚠️ Implement `detect_fraud()`
5. ✅ Configure AWS credentials
6. ✅ Set API endpoint
7. ✅ Test the workflow

---

**Status**: Template Ready - Implement your embedding and vector DB logic

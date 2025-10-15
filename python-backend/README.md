# Python YOLO Backend

## Setup

1. Place `best.pt` in this directory
2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python app.py
```

## Docker Deployment

```bash
docker build -t yolo-backend .
docker run -p 5000:5000 yolo-backend
```

## GCP Cloud Run Deployment

```bash
gcloud run deploy yolo-backend --source . --region=us-central1 --allow-unauthenticated --port=5000
```

Then update `.env.local`:
```
NEXT_PUBLIC_PYTHON_API_URL=https://yolo-backend-xxxxx-uc.a.run.app/detect
```

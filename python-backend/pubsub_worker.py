from google.cloud import pubsub_v1
from google.cloud import storage
import json
import os
from ultralytics import YOLO
import cv2
import numpy as np

PROJECT_ID = os.getenv('GCP_PROJECT_ID', 'green-plasma-475110-k7')
SUBSCRIPTION_ID = 'file-processing-sub'

model = YOLO('best.pt')
storage_client = storage.Client()
bucket = storage_client.bucket(os.getenv('GCS_BUCKET', 'chitti-ndt-storage'))

subscriber = pubsub_v1.SubscriberClient()
subscription_path = subscriber.subscription_path(PROJECT_ID, SUBSCRIPTION_ID)

def process_detection(filename, user_id):
    print(f"Processing {filename} for user {user_id}")
    
    blob = bucket.blob(filename)
    image_bytes = blob.download_as_bytes()
    
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    results = model(img)
    
    detections = []
    for r in results:
        for box in r.boxes:
            detections.append({
                'class': int(box.cls[0]),
                'confidence': float(box.conf[0]),
                'bbox': box.xyxy[0].tolist()
            })
    
    print(f"Found {len(detections)} defects")
    return detections

def callback(message):
    try:
        data = json.loads(message.data.decode('utf-8'))
        result = process_detection(data['filename'], data['userId'])
        print(f"Processed: {result}")
        message.ack()
    except Exception as e:
        print(f"Error: {e}")
        message.nack()

print(f"Listening for messages on {subscription_path}")
streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)

try:
    streaming_pull_future.result()
except KeyboardInterrupt:
    streaming_pull_future.cancel()

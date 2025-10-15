from celery import Celery
import pika
import json
from ultralytics import YOLO
import cv2
import numpy as np

celery_app = Celery('detection', broker='amqp://rabbitmq:5672')

model = YOLO('best.pt')

@celery_app.task
def process_detection(file_path: str, user_id: str):
    img = cv2.imread(file_path)
    results = model(img)
    
    detections = []
    for r in results:
        for box in r.boxes:
            detections.append({
                'class': int(box.cls[0]),
                'confidence': float(box.conf[0]),
                'bbox': box.xyxy[0].tolist()
            })
    
    return {'detections': detections, 'count': len(detections)}

def consume_queue():
    connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
    channel = connection.channel()
    channel.queue_declare(queue='file-processing', durable=True)
    
    def callback(ch, method, properties, body):
        data = json.loads(body)
        result = process_detection.delay(data['key'], data['userId'])
        ch.basic_ack(delivery_tag=method.delivery_tag)
    
    channel.basic_consume(queue='file-processing', on_message_callback=callback)
    channel.start_consuming()

if __name__ == '__main__':
    consume_queue()

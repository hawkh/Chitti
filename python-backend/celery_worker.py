from celery_app import celery_app
import pika
import json
from ultralytics import YOLO
import cv2
import numpy as np
import requests

model = YOLO('best.pt')

import logging
import logstash

host = 'logstash'
port = 5000

logger = logging.getLogger('python-logstash-logger')
logger.setLevel(logging.INFO)
logger.addHandler(logstash.TCPLogstashHandler(host, port, version=1))

@celery_app.task
def process_detection(file_path: str, user_id: str):
    logger.info('Processing detection for file: %s', file_path)
    try:
        img = cv2.imread(file_path)
        results = model(img)
        
        detections = []
        for r in results:
            for box in r.boxes:
                detection_data = {
                    'class': int(box.cls[0]),
                    'confidence': float(box.conf[0]),
                    'bbox': box.xyxy[0].tolist(),
                    'userId': user_id
                }
                detections.append(detection_data)
                requests.post("http://report-service:3003/detections", json=detection_data)
        
        logger.info('Successfully processed detection for file: %s', file_path)
        return {'detections': detections, 'count': len(detections)}
    except Exception as e:
        logger.error('Error processing detection for file: %s', file_path, exc_info=e)
        raise

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

from celery import group
import pika
import json
from celery_worker import process_detection
from celery_app import celery_app

@celery_app.task
def process_batch(file_paths: list[str], user_id: str):
    """
    Process a batch of files in parallel.
    """
    tasks = [process_detection.s(file_path, user_id) for file_path in file_paths]
    job = group(tasks)
    result = job.apply_async()
    return result.id

def consume_batch_queue():
    connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
    channel = connection.channel()
    channel.queue_declare(queue='batch-processing', durable=True)
    
    def callback(ch, method, properties, body):
        data = json.loads(body)
        process_batch.delay(data['keys'], data['userId'])
        ch.basic_ack(delivery_tag=method.delivery_tag)
    
    channel.basic_consume(queue='batch-processing', on_message_callback=callback)
    channel.start_consuming()

if __name__ == '__main__':
    consume_batch_queue()

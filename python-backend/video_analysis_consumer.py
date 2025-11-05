import pika
import json
from video_analyzer import analyze_video

def consume_video_analysis_queue():
    connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
    channel = connection.channel()
    channel.queue_declare(queue='video-analysis', durable=True)
    
    def callback(ch, method, properties, body):
        data = json.loads(body)
        analyze_video.delay(data['video_id'], data['user_id'])
        ch.basic_ack(delivery_tag=method.delivery_tag)
    
    channel.basic_consume(queue='video-analysis', on_message_callback=callback)
    channel.start_consuming()

if __name__ == '__main__':
    consume_video_analysis_queue()

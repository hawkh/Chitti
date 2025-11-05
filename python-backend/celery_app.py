from celery import Celery

celery_app = Celery('chitti-detection', 
                    broker='amqp://rabbitmq:5672', 
                    backend='rpc://',
                    include=['celery_worker', 'batch_worker', 'video_analyzer'])

celery_app.conf.task_routes = {
    'celery_worker.process_detection': {'queue': 'file-processing'},
    'batch_worker.process_batch': {'queue': 'batch-processing'},
    'video_analyzer.analyze_video': {'queue': 'video-analysis'},
}

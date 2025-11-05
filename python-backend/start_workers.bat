start cmd /k celery -A celery_app worker -l info -Q file-processing
start cmd /k celery -A celery_app worker -l info -Q batch-processing
start cmd /k celery -A celery_app worker -l info -Q video-analysis

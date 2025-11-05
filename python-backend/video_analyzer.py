from celery_app import celery_app
import requests

@celery_app.task
def analyze_video(video_id: str, user_id: str):
    # Retrieve detections from report-service
    response = requests.get(f"http://report-service:3003/detections/{user_id}")
    detections = response.json()

    # Aggregate results (placeholder)
    aggregated_results = {
        "video_id": video_id,
        "user_id": user_id,
        "total_detections": len(detections),
        "defects_by_class": {}
    }

    for detection in detections:
        class_id = detection['class']
        if class_id not in aggregated_results['defects_by_class']:
            aggregated_results['defects_by_class'][class_id] = 0
        aggregated_results['defects_by_class'][class_id] += 1

    # Store video-level result (placeholder)
    print(aggregated_results)

    return aggregated_results

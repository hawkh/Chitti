from fastapi import FastAPI, UploadFile, File, HTTPException
import ffmpeg
import os
import uuid
import pika
import json

app = FastAPI(title="Video Service")

RABBITMQ_URL = os.environ.get("RABBITMQ_URL", "amqp://admin:admin@rabbitmq:5672")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/videos/")
async def process_video(file: UploadFile = File(...), user_id: str = "default"):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only videos are allowed.")

    video_id = str(uuid.uuid4())
    temp_dir = f"/tmp/{video_id}"
    os.makedirs(temp_dir, exist_ok=True)

    video_path = f"{temp_dir}/{file.filename}"
    with open(video_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        (ffmpeg
            .input(video_path)
            .output(f"{temp_dir}/frame-%04d.png", vf="fps=1")
            .run())
    except ffmpeg.Error as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract frames: {e.stderr}")

    connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
    channel = connection.channel()
    channel.queue_declare(queue="file-processing", durable=True)

    frames = sorted(os.listdir(temp_dir))
    for frame in frames:
        if frame.endswith(".png"):
            frame_path = os.path.join(temp_dir, frame)
            message = {"key": frame_path, "userId": user_id}
            channel.basic_publish(
                exchange="",
                routing_key="file-processing",
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # make message persistent
                )
            )

    channel.queue_declare(queue="video-analysis", durable=True)
    message = {"video_id": video_id, "user_id": user_id}
    channel.basic_publish(
        exchange="",
        routing_key="video-analysis",
        body=json.dumps(message),
        properties=pika.BasicProperties(
            delivery_mode=2,  # make message persistent
        )
    )

    connection.close()

    return {"message": "Video is being processed.", "video_id": video_id, "frame_count": len(frames)}

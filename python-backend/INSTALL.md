# Quick Install & Run

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Server

```bash
python app.py
```

Server: http://localhost:8000
Docs: http://localhost:8000/docs

## Issues Fixed

✅ Python 3.13 compatibility (numpy version)
✅ Deprecated on_event warning (using lifespan)
✅ Changed default port to 8000 (avoiding 5000 conflict)

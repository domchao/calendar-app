# Developer Guide

## Environment Setup

Create a new python virtual environment

```
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
pre-commit install
```

## Run Apps

### Backend 

```
cd backend/
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- Explicitly setting the host to 0.0.0.0 allows the server to be accessible from external IP addresses (the app)

### Frontend

```
cd frontend/CalendarApp
npx expo start
```

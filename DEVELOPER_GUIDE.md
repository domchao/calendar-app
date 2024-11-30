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
uvicorn main:app --reload
```

### Frontend

```
cd frontend/CalendarApp
npx expo start
```

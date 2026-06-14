# CareerOS Backend

Python FastAPI backend for CareerOS.

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 4000 --app-dir src
```

## Routes

- `GET /api/health`
- `GET /api/candidate`
- `GET /api/employer`

# Eco Track AI - Carbon Footprint Tracker

Eco Track AI is a full-stack carbon footprint tracker with JWT authentication, text and image-based activity analysis, rule-based category detection, dynamic dashboard analytics, reduction goals, and live frontend updates.

## Structure

- `client` - React + Vite + Tailwind frontend
- `server` - Node.js + Express backend
- `ai-service` - Optional FastAPI microservice scaffold

## Backend setup

```bash
cd server
npm install
npm run dev
```

Create a `.env` in `server` using `.env.example`.

Notes:

- If `MONGO_URI` is unavailable or MongoDB is offline, the app falls back to in-memory storage so the server still runs.
- The default API port is `5056`.

## Frontend setup

```bash
cd client
npm install
npm run dev
```

Create a `.env` in `client` using `.env.example` if you need to override the API URL. By default the frontend targets `http://localhost:5056/api`.

## Optional AI service

```bash
cd ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## API endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/analyze`
- `GET /api/dashboard`
- `GET /api/analytics`
- `GET /api/activities`
- `GET /api/goals`
- `POST /api/goals`

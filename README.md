# QueueSense

AI-powered, privacy-first queue analytics MVP: anonymous people counting to estimate
waiting times and flag crowding.

## Problem statement

Clinics, banks and government offices routinely misjudge how long queues actually are,
with no data to plan staffing or communicate wait times to visitors.

## Solution

Point a camera at a queue (or upload footage) and QueueSense periodically counts people in
frame, turning that into an estimated wait time and a live dashboard — without identifying
anyone.

## Features

- Anonymous people counting via OpenCV DNN (MobileNet-SSD, "person" class only)
- Waiting-time estimate from a configurable service rate
- Peak-period tracking, crowd alert threshold
- Historical sample analytics with CSV export
- Demo mode using a bundled real people-counting clip

## Architecture

```text
frontend (React/Vite/TS/Tailwind)  ->  backend (FastAPI)  ->  SQLite
                                              |
                                     OpenCV DNN person counter (no tracking/identity)
```

## Technology stack

Python, FastAPI, SQLAlchemy, SQLite, OpenCV (DNN module); React, TypeScript, Vite,
Tailwind CSS, Recharts.

## Folder structure

```text
queuesense/
├── backend/
│   ├── app/          # FastAPI app, counting pipeline
│   ├── models/         # MobileNet-SSD prototxt + caffemodel
│   ├── demo/            # Bundled demo video
│   └── tests/
├── frontend/
│   └── src/               # Landing page + dashboard
├── docker-compose.yml
└── README.md
```

## Installation

```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Model files must exist at `backend/models/MobileNetSSD_deploy.{prototxt,caffemodel}` —
same fetch instructions as SafeSpeed AI's README.

```bash
cd frontend && npm install
```

## Environment variables

`SERVICE_RATE_PER_MINUTE` (used for the wait-time estimate), `CROWD_ALERT_THRESHOLD`,
`UPLOAD_DIR`, `MAX_UPLOAD_MB`, `CORS_ORIGINS` — see `backend/.env.example`.

## Running locally

```bash
# Terminal 1
cd backend && venv\Scripts\activate && uvicorn app.main:app --reload
# Terminal 2
cd frontend && npm run dev
```

Open http://localhost:5173. Docker: `docker compose up --build`.

## Demo instructions

Click **Run demo clip** — no camera needed. The bundled clip
(`backend/demo/people-demo.mp4`) is real footage from the Intel IoT DevKit sample video
set (CC-BY 4.0), verified during development to reliably trigger person detection
(multiple people detected simultaneously in several frames).

## API documentation

Docs at `/docs`. Key endpoints: `POST /api/analyze/demo`, `POST /api/analyze/video`,
`GET /api/samples`, `GET /api/samples/export`, `GET /api/dashboard/summary`.

## Database

SQLite: `analysis_sessions`, `queue_samples` — samples store only a count and a
timestamp, never an image or identity.

## Security considerations

- **API key required on every endpoint except `/api/health`.** Set `API_KEY` (backend
  `.env`) and `VITE_API_KEY` (frontend `.env`) to the same value before deploying anywhere
  reachable outside your own machine — the default (`dev-local-key-change-me`) is for
  local development only. Single-tenant "licensed instance" model, not per-user accounts.
- Rate limiting (10 req/60s/IP) on `/api/analyze*`.
- Upload size validated server-side, CORS restricted, no secrets in source.

## Privacy considerations

This is designed to be privacy-first by construction: each reading is an anonymous
headcount, not a list of tracked individuals. No frame-to-frame re-identification, no
faces stored, no images persisted after processing. This is the safest of the ten
projects in this portfolio for public-space deployment, but deployers should still post
standard CCTV/monitoring signage.

## Limitations

- Headcount is a per-sample snapshot from a single detector, not a calibrated crowd-density
  model — occlusion (people standing behind each other) will undercount.
- Waiting-time estimate is a simple `count / service_rate` heuristic — a real deployment
  should calibrate `SERVICE_RATE_PER_MINUTE` against actual historical service times.
- MobileNet-SSD (2017 model) works best on eye-level/moderately elevated camera views.

## Business model

**Target customers**: clinics, banks, government offices, retail stores, universities,
airports.

**Revenue**: per-location monthly subscription, analytics-only subscription, enterprise
multi-site dashboard.

## Future improvements

- Multi-camera aggregation for one physical queue
- Calibrated density estimation for heavily occluded queues
- SMS/display integration to show live wait times to visitors
- Historical staffing recommendations from peak-period data

## Screenshots

Run locally (see "Running locally") and click **Run demo clip** on `/app`.

# CarbonTrace AI — Deployment Guide

## Architecture

| Layer | Technology | Local Port |
|---|---|---|
| Frontend | React + Vite | 5173 |
| Backend | FastAPI + SQLite | 8000 |

---

## Local Development

### 1. Backend

```bash
cd backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Seed the database (first run only)
python -m app.seed

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend available at: `http://localhost:8000`
Swagger UI: `http://localhost:8000/docs`

### 2. Frontend

```bash
# From the project root
cp .env.example .env       # (already created for you)
npm install
npm run dev
```

Frontend available at: `http://localhost:5173`

### Demo accounts (seeded)

| Role | Email | Password |
|---|---|---|
| Entry | entry@example.com | entrypass |
| Verifier | verifier@example.com | verifierpass |
| Admin | admin@example.com | adminpass |

---

## Production Deployment

### Backend — Render

1. Create a **Web Service** on [Render](https://render.com).
2. Set the **Root Directory** to `backend`.
3. Set **Runtime** to `Python 3.11`.
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add the following **Environment Variables** in the Render dashboard:

| Variable | Value |
|---|---|
| `JWT_SECRET` | `<long random secret>` |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `PORT` | set automatically by Render |

> [!WARNING]
> **Database persistence:** This project uses SQLite which stores data in a local file.
> On Render's free tier, the filesystem is ephemeral — the database is reset on every deploy.
> For persistent data, upgrade to a persistent disk or migrate to PostgreSQL.

### Frontend — Vercel

1. Import the repository into [Vercel](https://vercel.com).
2. Set **Framework Preset** to `Vite`.
3. Set **Root Directory** to `.` (the project root, not `/backend`).
4. Add the following **Environment Variable** in Vercel settings:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com` |

5. Deploy. Vercel will run `npm run build` automatically.

---

## Required Environment Variables

### Backend

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | **Yes in production** | insecure default | JWT signing secret |
| `FRONTEND_URL` | **Yes in production** | (none) | Deployed frontend origin for CORS |
| `PORT` | Set by platform | `8000` | Uvicorn listen port |

### Frontend

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | **Yes in production** | `http://localhost:8000` | Backend API base URL |

---

## CORS Configuration

CORS is configured in `backend/app/main.py`.

Local origins always allowed:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

Production: set `FRONTEND_URL` env var to the deployed frontend URL.

`allow_origins=["*"]` is **not** used.

---

## Database Note

The current deployment uses **SQLite** (`carbontrace.db`) for the hackathon demo.

This is intentional — it requires no external database service for rapid deployment.

**For production persistence**, either:
1. Use a Render Persistent Disk and mount the SQLite file, or
2. Migrate to **PostgreSQL** by updating `DATABASE_URL` in `backend/app/database.py` and installing `psycopg2-binary`.

---

## API Endpoints Summary

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check |
| `/api/auth/login` | POST | OAuth2 login (form-urlencoded) |
| `/api/auth/me` | GET | Current user |
| `/api/suppliers` | GET, POST | List / create suppliers |
| `/api/suppliers/{id}` | GET | Supplier detail |
| `/api/shipments` | GET, POST | List / create shipments |
| `/api/shipments/{id}` | GET, PUT | Shipment detail / update |
| `/api/shipments/{id}/approve` | POST | Approve shipment |
| `/api/shipments/{id}/reject` | POST | Reject with reason |
| `/api/shipments/{id}/audit-log` | GET | Audit trail for shipment |
| `/api/shipments/upload-csv` | POST | Bulk CSV upload |
| `/api/shipments/parse-text` | POST | Natural language parsing |
| `/api/dashboard/summary` | GET | Dashboard KPIs |
| `/api/dashboard/trend` | GET | Monthly emissions trend |
| `/api/dashboard/by-mode` | GET | Breakdown by transport mode |
| `/api/dashboard/by-supplier` | GET | Breakdown by supplier |
| `/api/recommendations` | GET | Modal-shift recommendations |
| `/api/emission-factors` | GET | List emission factors |
| `/api/export/csv` | GET | Download shipments CSV |
| `/api/export/pdf` | GET | Download shipments PDF |

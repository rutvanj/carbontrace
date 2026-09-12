import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models

from .routers import auth as auth_router
from .routers import suppliers as suppliers_router
from .routers import shipments as shipments_router
from .routers import dashboard as dashboard_router
from .routers import export as export_router
from .routers import emission_factors as emission_factors_router
from .routers import recommendations as recommendations_router

# ── Production port (Render / Railway set $PORT; local defaults to 8000) ──────
APP_PORT = int(os.getenv("PORT", "8000"))

app = FastAPI(title="CarbonTrace Backend")

# ── CORS ─────────────────────────────────────────────────────────────────────
# Always allow local dev origins.
# In production, set FRONTEND_URL env var to the deployed frontend origin.
_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
_frontend_url = os.getenv("FRONTEND_URL", "").strip()
if _frontend_url and _frontend_url not in _origins:
    _origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$",
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Ensure all tables exist on every startup (idempotent)
    models.Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth_router.router, prefix="/api/auth")
app.include_router(suppliers_router.router, prefix="/api/suppliers")
app.include_router(shipments_router.router, prefix="/api/shipments")
app.include_router(dashboard_router.router, prefix="/api/dashboard")
app.include_router(export_router.router, prefix="/api/export")
app.include_router(emission_factors_router.router, prefix="/api/emission-factors")
app.include_router(recommendations_router.router, prefix="/api/recommendations")

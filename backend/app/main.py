import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models

from .routers import auth as auth_router
from .routers import suppliers as suppliers_router
from .routers import shipments as shipments_router
from .routers import dashboard as dashboard_router
from .routers import export as export_router
from .routers import emission_factors as emission_factors_router

APP_PORT = int(os.getenv("PORT", "4000"))

app = FastAPI(title="CarbonTrace Backend")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    models.Base = models


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth_router.router, prefix="/api/auth")
app.include_router(suppliers_router.router, prefix="/api/suppliers")
app.include_router(shipments_router.router, prefix="/api/shipments")
app.include_router(dashboard_router.router, prefix="/api/dashboard")
app.include_router(export_router.router, prefix="/api/export")
app.include_router(emission_factors_router.router, prefix="/api/emission-factors")

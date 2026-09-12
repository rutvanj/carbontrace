from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func
from .. import models, schemas
from ..database import get_db

router = APIRouter()


@router.get("/summary", response_model=schemas.DashboardSummary)
def summary(db: Session = Depends(get_db)):
    total_shipments = db.query(func.count(models.Shipment.id)).scalar() or 0
    total_emissions = db.query(func.coalesce(func.sum(models.Shipment.emissions), 0.0)).scalar() or 0.0
    verified = db.query(func.count(models.Shipment.id)).filter(models.Shipment.status == "VERIFIED").scalar() or 0
    pending = db.query(func.count(models.Shipment.id)).filter(models.Shipment.status == "PENDING").scalar() or 0
    rejected = db.query(func.count(models.Shipment.id)).filter(models.Shipment.status == "REJECTED").scalar() or 0
    return schemas.DashboardSummary(total_shipments=total_shipments, total_emissions=total_emissions, verified_shipments=verified, pending_shipments=pending, rejected_shipments=rejected)


@router.get("/by-mode")
def by_mode(db: Session = Depends(get_db)):
    q = db.query(models.Shipment.transport_mode, func.count(models.Shipment.id), func.coalesce(func.sum(models.Shipment.emissions), 0.0)).group_by(models.Shipment.transport_mode).all()
    return [{"transport_mode": r[0], "count": r[1], "emissions": r[2]} for r in q]


@router.get("/by-supplier")
def by_supplier(db: Session = Depends(get_db)):
    q = db.query(models.Supplier.name, func.count(models.Shipment.id), func.coalesce(func.sum(models.Shipment.emissions), 0.0)).join(models.Shipment, models.Shipment.supplier_id == models.Supplier.id).group_by(models.Supplier.id).all()
    return [{"supplier": r[0], "count": r[1], "emissions": r[2]} for r in q]


@router.get("/trend")
def trend(db: Session = Depends(get_db)):
    # simple monthly trend for last 6 months
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    start = now - timedelta(days=180)
    q = db.query(func.strftime('%Y-%m', models.Shipment.created_at), func.count(models.Shipment.id), func.coalesce(func.sum(models.Shipment.emissions), 0.0)).filter(models.Shipment.created_at >= start).group_by(func.strftime('%Y-%m', models.Shipment.created_at)).order_by(func.strftime('%Y-%m', models.Shipment.created_at)).all()
    return [{"period": r[0], "count": r[1], "emissions": r[2]} for r in q]

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import csv
import io
from datetime import datetime

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user, require_role
from ..ai_parser import parse_shipment_text

router = APIRouter()


def calculate_emissions(weight_tonnes: float, distance_km: float, emission_factor: float) -> float:
    return weight_tonnes * distance_km * emission_factor


@router.get("", response_model=List[schemas.ShipmentOut])
def list_shipments(db: Session = Depends(get_db)):
    return db.query(models.Shipment).all()


@router.post("", response_model=schemas.ShipmentOut)
def create_shipment(sh_in: schemas.ShipmentCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    ef = db.query(models.EmissionFactor).filter(models.EmissionFactor.mode == sh_in.transport_mode).first()
    if not ef:
        raise HTTPException(status_code=400, detail="Unknown transport mode or missing emission factor")
    emissions = calculate_emissions(sh_in.weight_tonnes, sh_in.distance_km, ef.factor)
    sh = models.Shipment(
        origin=sh_in.origin,
        destination=sh_in.destination,
        weight_tonnes=sh_in.weight_tonnes,
        distance_km=sh_in.distance_km,
        transport_mode=sh_in.transport_mode,
        emission_factor=ef.factor,
        emissions=emissions,
        supplier_id=sh_in.supplier_id,
        created_by_id=current.id,
    )
    db.add(sh)
    db.commit()
    db.refresh(sh)
    db.add(models.AuditLog(shipment_id=sh.id, action="CREATED", user_id=current.id, comment="Created via API"))
    db.commit()
    return sh


@router.get("/{shipment_id}", response_model=schemas.ShipmentOut)
def get_shipment(shipment_id: int, db: Session = Depends(get_db)):
    sh = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not sh:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return sh


@router.put("/{shipment_id}", response_model=schemas.ShipmentOut)
def update_shipment(shipment_id: int, sh_up: schemas.ShipmentUpdate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    sh = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not sh:
        raise HTTPException(status_code=404, detail="Shipment not found")
    for field, value in sh_up.dict(exclude_unset=True).items():
        setattr(sh, field, value)
    # recalc emissions if relevant fields changed
    ef = db.query(models.EmissionFactor).filter(models.EmissionFactor.mode == sh.transport_mode).first()
    sh.emission_factor = ef.factor if ef else sh.emission_factor
    sh.emissions = calculate_emissions(sh.weight_tonnes, sh.distance_km, sh.emission_factor)
    db.add(sh)
    db.commit()
    db.refresh(sh)
    db.add(models.AuditLog(shipment_id=sh.id, action="UPDATED", user_id=current.id, comment="Updated via API"))
    db.commit()
    return sh


@router.post("/{shipment_id}/approve")
def approve_shipment(shipment_id: int, db: Session = Depends(get_db), current=Depends(get_current_user)):
    require_role(current, ["VERIFIER", "ADMIN"])
    sh = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not sh:
        raise HTTPException(status_code=404, detail="Shipment not found")
    sh.status = "VERIFIED"
    sh.verified_by_id = current.id
    sh.verified_at = datetime.utcnow()
    db.add(models.AuditLog(shipment_id=sh.id, action="APPROVED", user_id=current.id, comment="Approved"))
    db.commit()
    return {"status": "ok"}


@router.post("/{shipment_id}/reject")
def reject_shipment(shipment_id: int, reason: str = "", db: Session = Depends(get_db), current=Depends(get_current_user)):
    require_role(current, ["VERIFIER", "ADMIN"])
    sh = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not sh:
        raise HTTPException(status_code=404, detail="Shipment not found")
    sh.status = "REJECTED"
    sh.verified_by_id = current.id
    sh.verified_at = datetime.utcnow()
    db.add(models.AuditLog(shipment_id=sh.id, action="REJECTED", user_id=current.id, comment=reason))
    db.commit()
    return {"status": "ok"}


@router.get("/{shipment_id}/audit-log", response_model=List[schemas.AuditLogOut])
def shipment_audit_log(shipment_id: int, db: Session = Depends(get_db)):
    logs = db.query(models.AuditLog).filter(models.AuditLog.shipment_id == shipment_id).order_by(models.AuditLog.timestamp.desc()).all()
    return logs


@router.post("/upload-csv")
def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db), current=Depends(get_current_user)):
    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))
    inserted = []
    errors = []
    for i, row in enumerate(reader, start=1):
        try:
            origin = row.get("origin") or row.get("from")
            destination = row.get("destination") or row.get("to")
            weight = float(row.get("weight_tonnes") or row.get("weight"))
            distance = float(row.get("distance_km") or row.get("distance"))
            mode = row.get("transport_mode")
            supplier_id = int(row.get("supplier_id")) if row.get("supplier_id") else None
            ef = db.query(models.EmissionFactor).filter(models.EmissionFactor.mode == mode).first()
            if not ef:
                raise ValueError(f"Unknown transport mode '{mode}'")
            emissions = calculate_emissions(weight, distance, ef.factor)
            sh = models.Shipment(origin=origin, destination=destination, weight_tonnes=weight, distance_km=distance, transport_mode=mode, emission_factor=ef.factor, emissions=emissions, supplier_id=supplier_id, created_by_id=current.id)
            db.add(sh)
            db.commit()
            db.refresh(sh)
            db.add(models.AuditLog(shipment_id=sh.id, action="CREATED_CSV", user_id=current.id, comment=f"Row {i}"))
            db.commit()
            inserted.append(sh.id)
        except Exception as e:
            errors.append({"row": i, "error": str(e)})
    return {"inserted_ids": inserted, "errors": errors}


@router.post("/parse-text")
def parse_text(body: schemas.ParseTextRequest):
    parsed = parse_shipment_text(body.text)
    return parsed

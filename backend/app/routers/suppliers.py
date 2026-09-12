from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter()


@router.get("", response_model=List[schemas.SupplierOut])
def list_suppliers(db: Session = Depends(get_db)):
    return db.query(models.Supplier).all()


@router.post("", response_model=schemas.SupplierOut)
def create_supplier(supplier_in: schemas.SupplierCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    s = models.Supplier(**supplier_in.dict())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@router.get("/{supplier_id}", response_model=schemas.SupplierOut)
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    s = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return s

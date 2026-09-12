from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter()


@router.get("", response_model=List[schemas.EmissionFactorOut])
def list_factors(db: Session = Depends(get_db)):
    return db.query(models.EmissionFactor).all()

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str]


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str]
    role: str

    class Config:
        orm_mode = True


class SupplierCreate(BaseModel):
    name: str
    address: Optional[str]
    contact_email: Optional[EmailStr]


class SupplierOut(BaseModel):
    id: int
    name: str
    address: Optional[str]
    contact_email: Optional[EmailStr]

    class Config:
        orm_mode = True


class EmissionFactorOut(BaseModel):
    id: int
    mode: str
    factor: float

    class Config:
        orm_mode = True


class ShipmentCreate(BaseModel):
    origin: str
    destination: str
    weight_tonnes: float = Field(gt=0)
    distance_km: float = Field(gt=0)
    transport_mode: str
    supplier_id: Optional[int]


class ShipmentOut(BaseModel):
    id: int
    origin: str
    destination: str
    weight_tonnes: float
    distance_km: float
    transport_mode: str
    emission_factor: float
    emissions: float
    status: str
    supplier_id: Optional[int]
    created_by_id: Optional[int]
    verified_by_id: Optional[int]
    created_at: datetime
    verified_at: Optional[datetime]

    class Config:
        orm_mode = True


class ShipmentUpdate(BaseModel):
    origin: Optional[str]
    destination: Optional[str]
    weight_tonnes: Optional[float]
    distance_km: Optional[float]
    transport_mode: Optional[str]


class AuditLogOut(BaseModel):
    id: int
    shipment_id: int
    action: str
    user_id: Optional[int]
    comment: Optional[str]
    timestamp: datetime

    class Config:
        orm_mode = True


class ParseTextRequest(BaseModel):
    text: str


class RecommendationRequest(BaseModel):
    transport_mode: str
    distance_km: float
    weight_tonnes: float
    emission_factor: float


class DashboardSummary(BaseModel):
    total_shipments: int
    total_emissions: float
    verified_shipments: int
    pending_shipments: int
    rejected_shipments: int

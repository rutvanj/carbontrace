import os
from sqlalchemy.exc import IntegrityError
from .database import engine, Base, SessionLocal
from . import models
from .auth import get_password_hash
from datetime import datetime, timedelta


def create_tables():
    Base.metadata.create_all(bind=engine)


def seed():
    create_tables()
    db = SessionLocal()
    try:
        # users
        users = [
            {"email": "entry@example.com", "password": "entrypass", "name": "Entry User", "role": "ENTRY"},
            {"email": "verifier@example.com", "password": "verifierpass", "name": "Verifier User", "role": "VERIFIER"},
            {"email": "admin@example.com", "password": "adminpass", "name": "Admin User", "role": "ADMIN"},
        ]
        for u in users:
            if not db.query(models.User).filter(models.User.email == u["email"]).first():
                user = models.User(email=u["email"], name=u["name"], hashed_password=get_password_hash(u["password"]), role=u["role"]) 
                db.add(user)
        db.commit()

        # suppliers
        suppliers = [
            {"name": "Acme Corp", "address": "1 Acme Way", "contact_email": "logistics@acme.example"},
            {"name": "Global Goods", "address": "100 Global Ave", "contact_email": "contact@global.example"},
        ]
        for s in suppliers:
            if not db.query(models.Supplier).filter(models.Supplier.name == s["name"]).first():
                db.add(models.Supplier(**s))
        db.commit()

        # emission factors (kg CO2e per tonne-km)
        factors = {
            "ROAD": 0.11,
            "RAIL": 0.03,
            "AIR": 0.60,
            "SEA": 0.015,
            "INLAND_WATERWAY": 0.02,
        }
        for mode, fac in factors.items():
            if not db.query(models.EmissionFactor).filter(models.EmissionFactor.mode == mode).first():
                db.add(models.EmissionFactor(mode=mode, factor=fac))
        db.commit()

        # shipments
        entry_user = db.query(models.User).filter(models.User.email == "entry@example.com").first()
        supplier = db.query(models.Supplier).first()
        ef_road = db.query(models.EmissionFactor).filter(models.EmissionFactor.mode == "ROAD").first()
        if entry_user and supplier and ef_road:
            shipments = [
                {"origin": "Berlin", "destination": "Hamburg", "weight_tonnes": 5.0, "distance_km": 300.0, "transport_mode": "ROAD"},
                {"origin": "Madrid", "destination": "Barcelona", "weight_tonnes": 2.0, "distance_km": 620.0, "transport_mode": "RAIL"},
            ]
            for s in shipments:
                ef = db.query(models.EmissionFactor).filter(models.EmissionFactor.mode == s["transport_mode"]).first()
                emissions = s["weight_tonnes"] * s["distance_km"] * (ef.factor if ef else 0)
                sh = models.Shipment(
                    origin=s["origin"],
                    destination=s["destination"],
                    weight_tonnes=s["weight_tonnes"],
                    distance_km=s["distance_km"],
                    transport_mode=s["transport_mode"],
                    emission_factor=ef.factor if ef else 0,
                    emissions=emissions,
                    status="PENDING",
                    supplier_id=supplier.id,
                    created_by_id=entry_user.id,
                )
                db.add(sh)
        db.commit()

        # create an audit for demo: approve second shipment
        verifier = db.query(models.User).filter(models.User.email == "verifier@example.com").first()
        sh = db.query(models.Shipment).filter(models.Shipment.destination == "Barcelona").first()
        if sh and verifier:
            sh.status = "VERIFIED"
            sh.verified_by_id = verifier.id
            sh.verified_at = datetime.utcnow()
            db.add(models.AuditLog(shipment_id=sh.id, action="APPROVED", user_id=verifier.id, comment="Demo approval"))
            db.commit()

        print("Seeding complete. Demo users: entry@example.com(entrypass), verifier@example.com(verifierpass), admin@example.com(adminpass)")

    except IntegrityError:
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed()

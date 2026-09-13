import os
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError
from .database import engine, Base, SessionLocal
from . import models
from .auth import get_password_hash


def create_tables():
    Base.metadata.create_all(bind=engine)


def seed_demo_data(db):
    """
    Idempotent demo data seeder.
    Ensures users, emission factors, suppliers, demo shipments, and audit logs
    are safely populated on backend startup without duplicating or overwriting data.
    """
    create_tables()

    try:
        # ── 1. Demo Users ────────────────────────────────────────────────────────
        demo_users = [
            {"email": "admin@carbontrace.io", "password": "admin123", "name": "System Administrator", "role": "ADMIN"},
            {"email": "verifier@carbontrace.io", "password": "verifier123", "name": "Lead ESG Verifier", "role": "VERIFIER"},
            {"email": "entry@carbontrace.io", "password": "entry123", "name": "Logistics Operations Officer", "role": "ENTRY"},
            {"email": "admin@example.com", "password": "adminpass", "name": "Admin User", "role": "ADMIN"},
            {"email": "verifier@example.com", "password": "verifierpass", "name": "Verifier User", "role": "VERIFIER"},
            {"email": "entry@example.com", "password": "entrypass", "name": "Entry User", "role": "ENTRY"},
        ]
        for u in demo_users:
            user = db.query(models.User).filter(models.User.email == u["email"]).first()
            if not user:
                user = models.User(
                    email=u["email"],
                    name=u["name"],
                    hashed_password=get_password_hash(u["password"]),
                    role=u["role"],
                )
                db.add(user)
            else:
                user.hashed_password = get_password_hash(u["password"])
                user.role = u["role"]
                if not user.name:
                    user.name = u["name"]
        db.commit()

        # ── 2. Demo Emission Factors ─────────────────────────────────────────────
        # Factors in kg CO2e per tonne-km (GLEC v3.0 / DEFRA aligned)
        factors = {
            "ROAD": 0.115,
            "RAIL": 0.02,
            "SEA": 0.015,
            "AIR": 0.75,
            "INLAND_WATERWAY": 0.03,
        }
        for mode, fac in factors.items():
            ef = db.query(models.EmissionFactor).filter(models.EmissionFactor.mode == mode).first()
            if not ef:
                db.add(models.EmissionFactor(mode=mode, factor=fac))
            else:
                ef.factor = fac
        db.commit()

        # ── 3. Demo Suppliers ───────────────────────────────────────────────────
        demo_suppliers = [
            {
                "name": "Anand Textiles Pvt Ltd",
                "address": "Plot 42, GIDC Industrial Estate, Surat, Gujarat",
                "contact_email": "dispatch@anandtextiles.com",
            },
            {
                "name": "Bharat Steel Traders",
                "address": "Industrial Area Phase II, Rourkela, Odisha",
                "contact_email": "logistics@bharatsteel.com",
            },
            {
                "name": "Coastal Foods Exports",
                "address": "Marine Drive Logistics Park, Kochi, Kerala",
                "contact_email": "shipping@coastalfoods.in",
            },
            {
                "name": "Acme Corp",
                "address": "1 Acme Way, Frankfurt, Germany",
                "contact_email": "logistics@acme.example",
            },
            {
                "name": "Global Goods",
                "address": "100 Global Ave, Rotterdam, Netherlands",
                "contact_email": "contact@global.example",
            },
        ]
        for s in demo_suppliers:
            existing_sup = db.query(models.Supplier).filter(models.Supplier.name == s["name"]).first()
            if not existing_sup:
                db.add(models.Supplier(**s))
        db.commit()

        # Build lookup dictionaries for relationships
        suppliers_by_name = {s.name: s.id for s in db.query(models.Supplier).all()}
        ef_by_mode = {ef.mode: ef.factor for ef in db.query(models.EmissionFactor).all()}

        entry_user = (
            db.query(models.User).filter(models.User.email == "entry@carbontrace.io").first()
            or db.query(models.User).filter(models.User.email == "entry@example.com").first()
        )
        verifier_user = (
            db.query(models.User).filter(models.User.email == "verifier@carbontrace.io").first()
            or db.query(models.User).filter(models.User.email == "verifier@example.com").first()
        )

        # ── 4. Demo Shipments & Audit Records ────────────────────────────────────
        # Only seed shipments if the demo shipment dataset is not already present.
        # This prevents duplicate shipments on repeated startups or server restarts.
        demo_marker = db.query(models.Shipment).filter(
            models.Shipment.origin == "Surat Textile Hub, Gujarat",
            models.Shipment.destination == "Mumbai JNPT Port Terminal",
        ).first()

        if not demo_marker:
            now = datetime.utcnow()
            demo_shipments = [
                {
                    "origin": "Surat Textile Hub, Gujarat",
                    "destination": "Mumbai JNPT Port Terminal",
                    "weight_tonnes": 28.5,
                    "distance_km": 290.0,
                    "transport_mode": "ROAD",
                    "supplier_name": "Anand Textiles Pvt Ltd",
                    "status": "VERIFIED",
                    "days_ago": 145,
                },
                {
                    "origin": "Rourkela Steel Complex",
                    "destination": "Kolkata Port Terminal 4",
                    "weight_tonnes": 65.0,
                    "distance_km": 420.0,
                    "transport_mode": "RAIL",
                    "supplier_name": "Bharat Steel Traders",
                    "status": "VERIFIED",
                    "days_ago": 135,
                },
                {
                    "origin": "Kochi Marine Gateway",
                    "destination": "Dubai Port Al-Ali",
                    "weight_tonnes": 120.0,
                    "distance_km": 2750.0,
                    "transport_mode": "SEA",
                    "supplier_name": "Coastal Foods Exports",
                    "status": "VERIFIED",
                    "days_ago": 115,
                },
                {
                    "origin": "Delhi Cargo Terminal (IGI)",
                    "destination": "Frankfurt Cargo City South",
                    "weight_tonnes": 8.5,
                    "distance_km": 6120.0,
                    "transport_mode": "AIR",
                    "supplier_name": "Anand Textiles Pvt Ltd",
                    "status": "VERIFIED",
                    "days_ago": 105,
                },
                {
                    "origin": "Varanasi Inland Terminal",
                    "destination": "Haldia Port Terminal (NW-1)",
                    "weight_tonnes": 85.0,
                    "distance_km": 920.0,
                    "transport_mode": "INLAND_WATERWAY",
                    "supplier_name": "Bharat Steel Traders",
                    "status": "VERIFIED",
                    "days_ago": 95,
                },
                {
                    "origin": "Ahmedabad Logistics Park",
                    "destination": "Chennai Distribution Center",
                    "weight_tonnes": 32.0,
                    "distance_km": 1850.0,
                    "transport_mode": "ROAD",
                    "supplier_name": "Anand Textiles Pvt Ltd",
                    "status": "VERIFIED",
                    "days_ago": 80,
                },
                {
                    "origin": "Jamshedpur Works",
                    "destination": "Nagpur Freight Hub",
                    "weight_tonnes": 45.0,
                    "distance_km": 780.0,
                    "transport_mode": "RAIL",
                    "supplier_name": "Bharat Steel Traders",
                    "status": "VERIFIED",
                    "days_ago": 65,
                },
                {
                    "origin": "Mangalore Processing Unit",
                    "destination": "Colombo Harbor, Sri Lanka",
                    "weight_tonnes": 90.0,
                    "distance_km": 850.0,
                    "transport_mode": "SEA",
                    "supplier_name": "Coastal Foods Exports",
                    "status": "VERIFIED",
                    "days_ago": 50,
                },
                {
                    "origin": "Bangalore Aerospace Hub",
                    "destination": "London Heathrow Cargo City",
                    "weight_tonnes": 6.2,
                    "distance_km": 7700.0,
                    "transport_mode": "AIR",
                    "supplier_name": "Bharat Steel Traders",
                    "status": "PENDING",
                    "days_ago": 38,
                },
                {
                    "origin": "Surat Weaving Mills",
                    "destination": "Nhava Sheva Terminal 2",
                    "weight_tonnes": 22.0,
                    "distance_km": 310.0,
                    "transport_mode": "ROAD",
                    "supplier_name": "Anand Textiles Pvt Ltd",
                    "status": "PENDING",
                    "days_ago": 25,
                },
                {
                    "origin": "Bhubaneswar Metal Depot",
                    "destination": "Visakhapatnam Steel Yard",
                    "weight_tonnes": 50.0,
                    "distance_km": 440.0,
                    "transport_mode": "RAIL",
                    "supplier_name": "Bharat Steel Traders",
                    "status": "PENDING",
                    "days_ago": 18,
                },
                {
                    "origin": "Kochi Cold Storage Facility",
                    "destination": "Rotterdam Cool Port Terminal",
                    "weight_tonnes": 75.0,
                    "distance_km": 7400.0,
                    "transport_mode": "SEA",
                    "supplier_name": "Coastal Foods Exports",
                    "status": "PENDING",
                    "days_ago": 12,
                },
                {
                    "origin": "Patna Inland Logistics Center",
                    "destination": "Kolkata Garden Reach Terminal",
                    "weight_tonnes": 40.0,
                    "distance_km": 580.0,
                    "transport_mode": "INLAND_WATERWAY",
                    "supplier_name": "Bharat Steel Traders",
                    "status": "PENDING",
                    "days_ago": 6,
                },
                {
                    "origin": "Pune Auto Components Hub",
                    "destination": "Munich Assembly Plant 4",
                    "weight_tonnes": 10.5,
                    "distance_km": 6750.0,
                    "transport_mode": "AIR",
                    "supplier_name": "Bharat Steel Traders",
                    "status": "PENDING",
                    "days_ago": 2,
                },
            ]

            for s_spec in demo_shipments:
                factor = ef_by_mode.get(s_spec["transport_mode"], 0.1)
                # Exact calculation formula: weight_tonnes * distance_km * emission_factor
                emissions = round(s_spec["weight_tonnes"] * s_spec["distance_km"] * factor, 4)
                created_dt = now - timedelta(days=s_spec["days_ago"])
                is_verified = s_spec["status"] == "VERIFIED"
                verified_dt = created_dt + timedelta(hours=18) if is_verified else None
                ver_id = verifier_user.id if is_verified and verifier_user else None
                sup_id = suppliers_by_name.get(s_spec["supplier_name"])

                shipment = models.Shipment(
                    origin=s_spec["origin"],
                    destination=s_spec["destination"],
                    weight_tonnes=s_spec["weight_tonnes"],
                    distance_km=s_spec["distance_km"],
                    transport_mode=s_spec["transport_mode"],
                    emission_factor=factor,
                    emissions=emissions,
                    status=s_spec["status"],
                    supplier_id=sup_id,
                    created_by_id=entry_user.id if entry_user else None,
                    verified_by_id=ver_id,
                    created_at=created_dt,
                    verified_at=verified_dt,
                )
                db.add(shipment)
                db.flush()  # assign shipment.id

                # Audit log for creation
                db.add(
                    models.AuditLog(
                        shipment_id=shipment.id,
                        action="CREATED",
                        user_id=entry_user.id if entry_user else None,
                        comment="Telemetry record ingested into Scope 3 freight ledger",
                        timestamp=created_dt,
                    )
                )

                # Audit log for verification if verified
                if is_verified:
                    db.add(
                        models.AuditLog(
                            shipment_id=shipment.id,
                            action="APPROVED",
                            user_id=ver_id,
                            comment="Compliance verification passed. Emission factor confirmed against GLEC v3.0.",
                            timestamp=verified_dt,
                        )
                    )

            db.commit()

    except IntegrityError:
        db.rollback()


def seed():
    """Manual seed runner for CLI usage: python -m app.seed"""
    create_tables()
    db = SessionLocal()
    try:
        seed_demo_data(db)
        print("Demo data seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

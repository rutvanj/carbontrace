from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models
from ..database import get_db

router = APIRouter()


# Emission factors from the database (kg CO2e / tonne-km)
# Used for deterministic recommendations without fabricating data.


@router.get("")
def get_recommendations(db: Session = Depends(get_db)):
    """
    Deterministic modal-shift recommendations.

    For each PENDING or VERIFIED shipment that uses a high-emission transport mode
    (ROAD or AIR), find lower-emission alternatives using the real emission factors
    from the database.

    Only recommends a mode if:
    - the mode exists in the emission_factors table
    - the alternative factor is genuinely lower than the current factor

    Returns a list of recommendations with real emission figures.
    """
    # Load all emission factors from DB
    factors_raw = db.query(models.EmissionFactor).all()
    factors = {ef.mode: ef.factor for ef in factors_raw}

    # Define the ordered preference for modal shift alternatives
    # (from lowest to highest carbon intensity)
    ALTERNATIVES = {
        "AIR": ["SEA", "INLAND_WATERWAY", "RAIL", "ROAD"],
        "ROAD": ["RAIL", "INLAND_WATERWAY", "SEA"],
        "SEA": [],   # Already low — do not recommend a shift
        "RAIL": [],  # Already low — do not recommend a shift
        "INLAND_WATERWAY": [],
    }

    shipments = (
        db.query(models.Shipment)
        .filter(models.Shipment.status.in_(["PENDING", "VERIFIED"]))
        .order_by(models.Shipment.emissions.desc())
        .limit(20)
        .all()
    )

    recommendations = []
    seen_ids = set()

    for sh in shipments:
        if sh.id in seen_ids:
            continue
        current_mode = sh.transport_mode
        current_factor = factors.get(current_mode)
        if current_factor is None:
            continue

        # Find the best lower-carbon alternative
        alternatives_for_mode = ALTERNATIVES.get(current_mode, [])
        best_alt = None
        best_alt_factor = current_factor

        for alt_mode in alternatives_for_mode:
            alt_factor = factors.get(alt_mode)
            if alt_factor is not None and alt_factor < best_alt_factor:
                best_alt = alt_mode
                best_alt_factor = alt_factor

        if best_alt is None:
            continue  # No improvement available

        # Calculate real emissions with alternative mode
        estimated_emissions = sh.weight_tonnes * sh.distance_km * best_alt_factor
        reduction_kg = sh.emissions - estimated_emissions
        if reduction_kg <= 0:
            continue

        reduction_percent = (reduction_kg / sh.emissions) * 100

        # Human-readable mode names
        mode_display = {
            "ROAD": "Road (Diesel Truck)",
            "RAIL": "Rail (Intermodal)",
            "AIR": "Air Freight",
            "SEA": "Sea Freight",
            "INLAND_WATERWAY": "Inland Waterway",
        }

        recommendations.append({
            "shipment_id": sh.id,
            "origin": sh.origin,
            "destination": sh.destination,
            "weight_tonnes": sh.weight_tonnes,
            "distance_km": sh.distance_km,
            "current_mode": current_mode,
            "current_mode_display": mode_display.get(current_mode, current_mode),
            "current_factor": current_factor,
            "current_emissions": round(sh.emissions, 2),
            "recommended_mode": best_alt,
            "recommended_mode_display": mode_display.get(best_alt, best_alt),
            "recommended_factor": best_alt_factor,
            "estimated_emissions": round(estimated_emissions, 2),
            "reduction_kg": round(reduction_kg, 2),
            "reduction_percent": round(reduction_percent, 1),
            "basis": f"Emission factors: {current_mode} = {current_factor} kg CO₂e/t·km, {best_alt} = {best_alt_factor} kg CO₂e/t·km (DEFRA/GLEC)",
        })
        seen_ids.add(sh.id)

    # Sort by highest absolute saving first
    recommendations.sort(key=lambda r: r["reduction_kg"], reverse=True)
    return recommendations

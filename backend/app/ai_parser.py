import re
from typing import Dict, Optional


def parse_shipment_text(text: str) -> Dict[str, Optional[str]]:
    # deterministic regex/keyword based parsing fallback
    result = {"origin": None, "destination": None, "weight_tonnes": None, "transport_mode": None, "distance_km": None}

    # weight (tonnes)
    m = re.search(r"(\d+(?:\.\d+)?)\s*(?:t|tonne|tonnes|tons)\b", text, re.IGNORECASE)
    if m:
        result["weight_tonnes"] = float(m.group(1))

    # distance (km)
    m = re.search(r"(\d+(?:\.\d+)?)\s*(?:km|kilometers|kilometres)\b", text, re.IGNORECASE)
    if m:
        result["distance_km"] = float(m.group(1))

    # modes
    modes = {
        "ROAD": ["road", "truck", "lorry", "diesel"],
        "RAIL": ["rail", "train"],
        "AIR": ["air", "flight", "airfreight", "air freight"],
        "SEA": ["sea", "ship", "vessel", "ocean"],
        "INLAND_WATERWAY": ["inland", "barge", "inland waterway"],
    }
    lowered = text.lower()
    for mode, keywords in modes.items():
        for kw in keywords:
            if kw in lowered:
                result["transport_mode"] = mode
                break
        if result["transport_mode"]:
            break

    # simple origin/destination detection using 'from' and 'to'
    m = re.search(r"from\s+([A-Za-z0-9 ,.-]+?)\s+(?:to|->)\s+([A-Za-z0-9 ,.-]+)", text, re.IGNORECASE)
    if m:
        result["origin"] = m.group(1).strip()
        result["destination"] = m.group(2).strip()
    else:
        # fallback: look for 'origin:' and 'destination:'
        m1 = re.search(r"origin\s*[:\-]\s*([A-Za-z0-9 ,.-]+)", text, re.IGNORECASE)
        m2 = re.search(r"destination\s*[:\-]\s*([A-Za-z0-9 ,.-]+)", text, re.IGNORECASE)
        if m1:
            result["origin"] = m1.group(1).strip()
        if m2:
            result["destination"] = m2.group(1).strip()

    return result

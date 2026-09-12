from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import csv
import io
from fpdf import FPDF

from .. import models
from ..database import get_db

router = APIRouter()


@router.get("/csv")
def export_csv(db: Session = Depends(get_db)):
    shipments = db.query(models.Shipment).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "origin", "destination", "weight_tonnes", "distance_km", "transport_mode", "emission_factor", "emissions", "status"])
    for s in shipments:
        writer.writerow([s.id, s.origin, s.destination, s.weight_tonnes, s.distance_km, s.transport_mode, s.emission_factor, s.emissions, s.status])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue().encode()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=shipments.csv"})


@router.get("/pdf")
def export_pdf(db: Session = Depends(get_db)):
    shipments = db.query(models.Shipment).all()
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 10, "Shipments Report", ln=True)
    for s in shipments:
        pdf.multi_cell(0, 8, f"ID: {s.id} | {s.origin} -> {s.destination} | {s.weight_tonnes} t | {s.transport_mode} | emissions: {s.emissions:.2f}")
    out = io.BytesIO()
    out.write(pdf.output(dest="S").encode('latin-1'))
    out.seek(0)
    return StreamingResponse(out, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=shipments.pdf"})

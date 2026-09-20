import sys
import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add current directory to path for local or Vercel execution
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from chem_engine import analyze_molecule_pipeline
from pdf_generator import create_dossier_pdf

app = FastAPI(
    title="Drug-Likeness & Lipinski Dossier API",
    description="Bio/Cheminformatics API providing RDKit molecular profiling, 2D depictions, 3D conformers, and PDF dossiers.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    query: str

class ExportPdfRequest(BaseModel):
    query: Optional[str] = None
    analysis_data: Optional[dict] = None

@app.get("/")
@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "drug-likeness-dossier-api"}

@app.post("/analyze")
@app.post("/api/analyze")
def analyze_molecule(req: AnalyzeRequest):
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query (SMILES or compound name) must not be empty.")
    try:
        results = analyze_molecule_pipeline(req.query.strip())
        if "radar_png_bytes" in results:
            del results["radar_png_bytes"]
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/analyze")
@app.get("/api/analyze")
def analyze_molecule_get(query: str):
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Query parameter must not be empty.")
    try:
        results = analyze_molecule_pipeline(query.strip())
        if "radar_png_bytes" in results:
            del results["radar_png_bytes"]
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/export-pdf")
@app.post("/api/export-pdf")
def export_pdf(req: ExportPdfRequest):
    try:
        if req.analysis_data:
            data = req.analysis_data
        elif req.query and req.query.strip():
            data = analyze_molecule_pipeline(req.query.strip())
        else:
            raise HTTPException(status_code=400, detail="Either 'analysis_data' or 'query' must be provided.")
            
        pdf_bytes = create_dossier_pdf(data)
        compound_name = data.get("metadata", {}).get("name", "molecule").replace(" ", "_")
        filename = f"{compound_name}_Lipinski_Dossier.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Type": "application/pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@app.get("/export-pdf")
@app.get("/api/export-pdf")
def export_pdf_get(query: str):
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Query parameter must not be empty.")
    try:
        data = analyze_molecule_pipeline(query.strip())
        pdf_bytes = create_dossier_pdf(data)
        compound_name = data.get("metadata", {}).get("name", "molecule").replace(" ", "_")
        filename = f"{compound_name}_Lipinski_Dossier.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Type": "application/pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

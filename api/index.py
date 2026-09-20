import sys
import os
import traceback
from typing import Optional
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add current directory to path for local and Vercel serverless execution
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from chem_engine import analyze_molecule_pipeline, resolve_molecule
from pdf_generator import create_dossier_pdf
from rdkit import Chem

app = FastAPI(
    title="Cheminformatics Virtual Lab API",
    description="Bio/Cheminformatics serverless API providing RDKit molecular profiling, 2D vector depictions, 3D conformers, and publication-grade PDF dossiers.",
    version="2.0.0"
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
    return {
        "status": "online",
        "service": "cheminformatics-virtual-lab-api",
        "version": "2.0.0",
        "features": ["Lipinski", "Veber", "Ghose", "Morgan_FP", "ETKDGv3_3D", "ReportLab_PDF", "PubChem_PUG_REST"]
    }

@app.post("/analyze")
@app.post("/api/analyze")
def analyze_molecule(req: AnalyzeRequest):
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query (SMILES, CAS, CID, InChI, or name) must not be empty.")
    try:
        results = analyze_molecule_pipeline(req.query.strip())
        if "radar_png_bytes" in results:
            del results["radar_png_bytes"]
        return results
    except Exception as e:
        traceback.print_exc()
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
        traceback.print_exc()
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
        filename = f"{compound_name}_Cheminformatics_Dossier.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Type": "application/pdf"
            }
        )
    except Exception as e:
        traceback.print_exc()
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
        filename = f"{compound_name}_Cheminformatics_Dossier.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Type": "application/pdf"
            }
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@app.get("/structure/mol")
@app.get("/api/structure/mol")
def export_mol_block(query: str):
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Query parameter must not be empty.")
    try:
        mol, meta = resolve_molecule(query.strip())
        mol_block = Chem.MolToMolBlock(mol)
        name = meta.get("name", "molecule").replace(" ", "_")
        return Response(
            content=mol_block,
            media_type="chemical/x-mdl-molfile",
            headers={
                "Content-Disposition": f'attachment; filename="{name}.mol"',
                "Content-Type": "chemical/x-mdl-molfile"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

import sys
import os
import traceback
from typing import Optional
from fastapi import FastAPI, HTTPException, Response, Request
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
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    query: Optional[str] = None

class ExportPdfRequest(BaseModel):
    query: Optional[str] = None
    analysis_data: Optional[dict] = None

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "cheminformatics-virtual-lab-api",
        "version": "2.1.0",
        "features": ["Lipinski", "Veber", "Ghose", "Morgan_FP", "ETKDGv3_3D", "ReportLab_PDF", "PubChem_PUG_REST"]
    }

@app.api_route("/", methods=["GET", "POST"])
@app.api_route("/api", methods=["GET", "POST"])
@app.api_route("/analyze", methods=["GET", "POST"])
@app.api_route("/api/analyze", methods=["GET", "POST"])
async def analyze_endpoint(request: Request, query: Optional[str] = None):
    # Extract query from JSON body, URL params, or form
    q = query
    if not q:
        try:
            body = await request.json()
            if isinstance(body, dict):
                q = body.get("query")
        except Exception:
            pass

    # If it's a GET to root with no query, return health check
    if not q or not q.strip():
        if request.method == "GET" and request.url.path in ["/", "/api", "/api/"]:
            return health_check()
        raise HTTPException(status_code=400, detail="Query parameter (SMILES, CAS, CID, InChI, or name) must not be empty.")

    try:
        results = analyze_molecule_pipeline(q.strip())
        if "radar_png_bytes" in results:
            del results["radar_png_bytes"]
        return results
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@app.api_route("/export-pdf", methods=["GET", "POST"])
@app.api_route("/api/export-pdf", methods=["GET", "POST"])
async def export_pdf_endpoint(request: Request, query: Optional[str] = None):
    q = query
    analysis_data = None

    if request.method == "POST":
        try:
            body = await request.json()
            if isinstance(body, dict):
                analysis_data = body.get("analysis_data")
                q = body.get("query") or q
        except Exception:
            pass

    try:
        if analysis_data:
            data = analysis_data
        elif q and q.strip():
            data = analyze_molecule_pipeline(q.strip())
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

@app.api_route("/structure/mol", methods=["GET", "POST"])
@app.api_route("/api/structure/mol", methods=["GET", "POST"])
async def export_mol_block(request: Request, query: Optional[str] = None):
    q = query
    if not q:
        try:
            body = await request.json()
            if isinstance(body, dict):
                q = body.get("query")
        except Exception:
            pass

    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="Query parameter must not be empty.")
    try:
        mol, meta = resolve_molecule(q.strip())
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

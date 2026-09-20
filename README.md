# Drug-Likeness & Lipinski Dossier Generator

An automated full-stack bio/cheminformatics web application engineered for small-molecule drug discovery profiling, multi-style 2D and 3D molecular visualization, and publication-ready PDF dossier generation.

Optimized for serverless deployment on **Vercel** with a Next.js frontend and Python serverless backend (`rdkit`, `pubchempy`, `reportlab`, `matplotlib`).

---

## Key Features

### 1. Molecule Resolution & Database Lookup
- **Dual Input Modes**: Accepts canonical SMILES strings or common compound names (e.g. *Aspirin*, *Atorvastatin*, *Remdesivir*).
- **PubChem Auto-Lookup**: Resolves IUPAC nomenclature, PubChem Compound ID (CID), molecular formula, and standardized SMILES.

### 2. Physicochemical Profiling & Rule Compliance
- **Lipinski's Rule of 5 Evaluation**:
  - Molecular Weight ($MW \le 500\text{ g/mol}$)
  - Partition Coefficient ($\text{MolLogP} \le 5.0$)
  - Hydrogen Bond Donors ($HBD \le 5$)
  - Hydrogen Bond Acceptors ($HBA \le 10$)
  - Lipinski Rule of 5 violation tally and pass/alert classification.
- **Veber Rule Evaluation**:
  - Rotatable Bonds ($RotB \le 10$)
  - Topological Polar Surface Area ($TPSA \le 140\text{ \AA}^2$)
- **Extended Descriptors**:
  - Heavy atom count, chiral stereocenters count (and $R/S$ assignments), total ring count, aromatic ring count, Fraction Csp3 ($f_{sp^3}$), and Molar Refractivity ($MR$).

### 3. Multi-Style 2D Molecular Depiction Engine
Generates four distinct high-resolution rendering styles returned as base64 PNGs:
1. **Standard Skeletal / Line-Angle Formula**: Clean organic chemistry bond drawing.
2. **Stereochemical Wedge-and-Dash**: Explicit chiral stereocenters highlighted with color indicators.
3. **Full Explicit Atom Representation**: All implicit hydrogens and carbon atoms explicitly drawn.
4. **Bemis-Murcko Scaffold Extraction**: Core ring and linker framework isolated for scaffold hopping analysis.

### 4. Interactive 3D Molecular WebGL Canvas (3Dmol.js)
- **3D Conformer Generation**: Automatic hydrogen addition, coordinate embedding via **ETKDGv3**, and force-field energy minimization using **MMFF94** (with **UFF** and 2D fallbacks).
- **Electrostatic Potential (ESP) Mapping**: Atom-centered **Gasteiger partial charges** computed and mapped as continuous Red-White-Blue gradients over molecular surfaces.
- **4 Model Display Modes**:
  - Wireframe / Line (thin element-colored bonds)
  - Stick / Licorice (cylinders, no distinct atom spheres)
  - Ball-and-Stick (scaled atom spheres and bond cylinders)
  - Space-Filling / CPK (Van der Waals radii spheres)
- **Surface Overlays**:
  - Van der Waals Surface (VDW)
  - Solvent Accessible Surface (SAS)
  - Solvent Excluded Surface (SES / Connolly)
  - Electrostatic Potential (ESP) mapped surface
- **Camera Controls**:
  - Real-time auto-spin toggle
  - Reset camera view
  - Toggle hydrogen visibility
  - High-res snapshot PNG capture

### 5. Normalized Lipinski Radar Plot
- Matplotlib polar chart displaying the candidate molecule's parameters normalized against the 1.0 boundary limit.
- Instantly visualizes whether a compound lies within the oral bioavailability chemical space.

### 6. Publication-Ready PDF Dossier Generation (`/api/export-pdf`)
- Engineered with ReportLab Platypus (`SimpleDocTemplate`, `Table`, `Image`, `Paragraph`).
- Generates a formatted executive PDF report containing:
  - Header with metadata, compound name, CID, formula, and generation timestamp.
  - Side-by-side descriptor comparison table with color-coded Pass/Alert badges.
  - High-resolution figures: Standard Skeletal formula, Bemis-Murcko scaffold, and Lipinski Radar chart.
  - Structural and stereochemical property summary.
  - Cheminformatics methodology notes.
  - Streamed directly with `application/pdf` in-memory buffers.

---

## Tech Stack & Architecture

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React icons.
- **3D Molecular Engine**: 3Dmol.js WebGL canvas.
- **Backend**: Python 3.12 Serverless Functions (FastAPI / BaseHTTPRequestHandler).
- **Cheminformatics Dependencies**:
  - `rdkit`: Molecular representations, ETKDGv3 3D conformers, MMFF94 minimization, Gasteiger charges, Bemis-Murcko scaffolds.
  - `pubchempy`: Automated PubChem compound name resolution.
  - `matplotlib`: Polar radar chart rendering (`Agg` headless backend).
  - `reportlab`: PDF dossier compilation.
  - `pillow`: Image processing buffers.

---

## Project Structure

```
drug-likeness-dossier/
├── api/
│   ├── __init__.py
│   ├── chem_engine.py       # Core RDKit, PubChem, Conformer, and Radar calculation routines
│   ├── pdf_generator.py     # ReportLab Platypus publication-ready dossier builder
│   ├── index.py             # FastAPI app with /api/analyze, /api/export-pdf, /api/health
│   ├── analyze.py           # Vercel serverless entrypoint for /api/analyze
│   └── export_pdf.py        # Vercel serverless entrypoint for /api/export-pdf
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout loading 3Dmol.js CDN
│   │   ├── page.tsx         # Interactive dashboard page
│   │   └── globals.css      # Custom styles & glassmorphism
│   ├── components/
│   │   ├── SearchBar.tsx    # Query input with quick-select drug chips
│   │   ├── MetricCards.tsx  # Lipinski & Veber cards with status badges
│   │   ├── Viewer2D.tsx     # Tabbed 2D depiction viewer
│   │   ├── Viewer3D.tsx     # 3Dmol.js WebGL viewer with full control bar
│   │   ├── RadarChart.tsx   # Normalized Lipinski radar plot display
│   │   └── DossierExport.tsx# PDF download trigger
│   ├── types/
│   │   └── chem.ts          # TypeScript interfaces
│   └── lib/
│       └── samples.ts       # Preset drug molecules (Aspirin, Caffeine, Atorvastatin, etc.)
├── package.json             # NPM dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── next.config.js           # Next.js config with local dev API rewrites
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── requirements.txt         # Python dependencies
├── vercel.json              # Vercel serverless configuration
└── README.md                # Project documentation
```

---



**Response:**
JSON object containing:
- `metadata`: Compound name, formula, CID, IUPAC name, canonical SMILES.
- `properties`: Lipinski & Veber parameters, pass/fail booleans, violation count, extended descriptors.
- `depictions`: 4 base64 PNG images (`skeletal`, `wedge_dash`, `explicit_atoms`, `murcko_scaffold`).
- `conformer_3d`: SDF MolBlock string, optimization method (`MMFF94 (Minimized)`), atom coordinates, Gasteiger charges.
- `radar_b64`: Base64 PNG of the normalized Lipinski radar chart.

### `POST /api/export-pdf`
**Request Payload:**
```json
{
  "query": "Aspirin"
}
```
*Or pass the cached analysis payload:*
```json
{
  "analysis_data": { ... }
}
```

**Response:**
Binary stream with header `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="Aspirin_Lipinski_Dossier.pdf"`.

---

## License
MIT License. Built for pharmaceutical chemistry, medicinal informatics, and educational computational biology workflows.

# Drug-Likeness & Lipinski Dossier Generator

An automated full-stack bio/cheminformatics web application engineered for small-molecule drug discovery profiling, multi-style 2D and 3D molecular visualization, and publication-ready PDF dossier generation.

Optimized for 1-click serverless deployment on **Vercel** with a Next.js frontend and Python serverless backend (`rdkit`, `pubchempy`, `reportlab`, `matplotlib`).

---

## Deploy to Vercel (1-Click)

### Step 1: Create a GitHub Repository and Push
Open terminal / PowerShell in this directory (`drug-likeness-dossier`):

```bash
# 1. Create a new empty repository on GitHub: https://github.com/new (Name: drug-likeness-dossier)
# 2. Link and push:
git remote set-url origin https://github.com/orheil-shiv/drug-likeness-dossier.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** -> **"Project"**.
3. Select your `drug-likeness-dossier` GitHub repository and click **"Import"**.
4. Leave all settings at default (**Framework Preset: Next.js**, **Root Directory: ./**).
5. Click **"Deploy"**.

Vercel will automatically:
- Build the Next.js frontend using `package.json`.
- Package the Python backend using `requirements.txt` and `api/index.py`.
- Configure `/api/*` rewrites defined in `vercel.json`.

Your application will be live on `https://your-project.vercel.app` in under 2 minutes!

---

## Key Features

### 1. Molecule Resolution & Database Lookup
- **Dual Input Modes**: Accepts canonical SMILES strings (e.g., `CC(=O)Oc1ccccc1C(=O)O`) or common compound names (e.g., *Aspirin*, *Atorvastatin*, *Remdesivir*).
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
- Matplotlib polar chart displaying candidate molecule parameters normalized against the 1.0 boundary limit.
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
- **Backend**: Python 3.12 Serverless Functions (FastAPI / ASGI).
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
├── .gitignore               # Excludes node_modules, .next, __pycache__, etc.
├── vercel.json              # Zero-config serverless rewrites (/api/* -> api/index.py)
├── requirements.txt         # Serverless Python dependencies
├── package.json             # NPM dependencies & concurrent dev runner
├── next.config.js           # Next.js config with dev proxy rewrites
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── api/
│   ├── chem_engine.py       # Core RDKit, PubChem, Conformer, and Radar routines
│   ├── pdf_generator.py     # ReportLab Platypus publication-ready dossier builder
│   ├── index.py             # FastAPI serverless handler (/api/analyze, /api/export-pdf)
│   ├── analyze.py           # Vercel serverless entrypoint for /api/analyze
│   └── export_pdf.py        # Vercel serverless entrypoint for /api/export-pdf
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout loading 3Dmol.js CDN
│   │   ├── page.tsx         # Interactive molecular dashboard
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
│       └── samples.ts       # Preset candidate drugs (Aspirin, Caffeine, Atorvastatin, etc.)
└── README.md                # Project documentation
```

---

## Local Development

### Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **Python**: 3.10, 3.11, or 3.12

### 1. Install Dependencies

**Python Backend:**
```bash
pip install -r requirements.txt
```

**Next.js Frontend:**
```bash
npm install
```

### 2. Run Locally

Run both the Next.js frontend and Python backend concurrently with a single command:
```bash
npm run dev
```

This launches:
- **FastAPI Backend**: `http://localhost:8000` (API documentation available at `/docs`)
- **Next.js Frontend**: `http://localhost:3000`

---

## API Endpoints Reference

### `POST /api/analyze`
**Request Payload:**
```json
{
  "query": "Aspirin"
}
```
*Or canonical SMILES:*
```json
{
  "query": "CC(=O)Oc1ccccc1C(=O)O"
}
```

**Response JSON:**
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
MIT License. Built for pharmaceutical chemistry, medicinal informatics, and computational biology workflows.

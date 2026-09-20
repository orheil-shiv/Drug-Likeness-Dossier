import io
import base64
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image

from rdkit import Chem, RDLogger
from rdkit.Chem import Descriptors, AllChem, rdMolDescriptors
from rdkit.Chem.Scaffolds import MurckoScaffold
from rdkit.Chem.Draw import rdMolDraw2D
import pubchempy as pcp

# Suppress harmless syntax error noise during SMILES vs name detection
lg = RDLogger.logger()
lg.setLevel(RDLogger.CRITICAL)

def resolve_molecule(query: str):
    """
    Resolves input query (SMILES string or compound name) to a standardized RDKit Mol object
    and associated metadata.
    """
    query = query.strip()
    mol = Chem.MolFromSmiles(query)
    
    metadata = {
        "query": query,
        "input_type": "smiles" if mol is not None else "name",
        "name": query,
        "iupac_name": "",
        "cid": None,
        "formula": "",
        "smiles": query,
        "warnings": []
    }
    
    if mol is not None:
        metadata["formula"] = rdMolDescriptors.CalcMolFormula(mol)
        metadata["smiles"] = Chem.MolToSmiles(mol, canonical=True)
        # Attempt quick pubchem lookup for name & CID if it was a SMILES
        try:
            compounds = pcp.get_compounds(metadata["smiles"], 'smiles')
            if compounds and len(compounds) > 0:
                c = compounds[0]
                metadata["cid"] = c.cid
                metadata["iupac_name"] = c.iupac_name or ""
                metadata["name"] = c.synonyms[0] if (hasattr(c, 'synonyms') and c.synonyms) else (c.iupac_name or query)
        except Exception:
            pass
    else:
        # Resolve via PubChem
        try:
            compounds = pcp.get_compounds(query, 'name')
            if not compounds:
                raise ValueError(f"Could not resolve compound '{query}' in PubChem or as a valid SMILES.")
            c = compounds[0]
            resolved_smiles = getattr(c, 'connectivity_smiles', None) or getattr(c, 'canonical_smiles', None) or getattr(c, 'isomeric_smiles', None)
            if not resolved_smiles:
                raise ValueError(f"PubChem resolved CID {c.cid} for '{query}', but no valid SMILES was returned.")
            
            mol = Chem.MolFromSmiles(resolved_smiles)
            if mol is None:
                raise ValueError(f"RDKit failed to parse SMILES from PubChem: {resolved_smiles}")
            
            metadata["name"] = query.capitalize()
            metadata["cid"] = c.cid
            metadata["formula"] = c.molecular_formula or rdMolDescriptors.CalcMolFormula(mol)
            metadata["iupac_name"] = c.iupac_name or ""
            metadata["smiles"] = Chem.MolToSmiles(mol, canonical=True)
        except Exception as e:
            if "Could not resolve" in str(e) or "failed to parse" in str(e):
                raise
            raise ValueError(f"Failed to resolve compound '{query}': {str(e)}")
            
    return mol, metadata

def calculate_physicochemical_properties(mol):
    """
    Calculates Lipinski Rule of 5, Veber rule parameters, and extended bio-cheminformatics descriptors.
    """
    mw = float(Descriptors.MolWt(mol))
    logp = float(Descriptors.MolLogP(mol))
    hbd = int(Descriptors.NumHDonors(mol))
    hba = int(Descriptors.NumHAcceptors(mol))
    tpsa = float(Descriptors.TPSA(mol))
    rotb = int(Descriptors.NumRotatableBonds(mol))
    
    # Extended metrics
    heavy_atoms = int(mol.GetNumHeavyAtoms())
    rings = int(rdMolDescriptors.CalcNumRings(mol))
    aromatic_rings = int(rdMolDescriptors.CalcNumAromaticRings(mol))
    fsp3 = float(rdMolDescriptors.CalcFractionCSP3(mol))
    molar_refractivity = float(Descriptors.MolMR(mol))
    
    # Stereochemistry
    mol_copy = Chem.Mol(mol)
    Chem.AssignStereochemistry(mol_copy, force=True, cleanIt=True)
    chiral_centers = Chem.FindMolChiralCenters(mol_copy, includeUnassigned=True)
    chiral_count = len(chiral_centers)
    
    # Lipinski Rule of 5 evaluation (MW <= 500, LogP <= 5.0, HBD <= 5, HBA <= 10)
    lipinski_checks = {
        "mw": {"value": round(mw, 2), "limit": 500.0, "passed": mw <= 500.0, "unit": "g/mol", "name": "Molecular Weight"},
        "logp": {"value": round(logp, 2), "limit": 5.0, "passed": logp <= 5.0, "unit": "", "name": "MolLogP"},
        "hbd": {"value": hbd, "limit": 5, "passed": hbd <= 5, "unit": "", "name": "H-Bond Donors"},
        "hba": {"value": hba, "limit": 10, "passed": hba <= 10, "unit": "", "name": "H-Bond Acceptors"}
    }
    lipinski_violations = sum(1 for item in lipinski_checks.values() if not item["passed"])
    
    # Veber Rules (RotB <= 10, TPSA <= 140)
    veber_checks = {
        "rotb": {"value": rotb, "limit": 10, "passed": rotb <= 10, "unit": "", "name": "Rotatable Bonds"},
        "tpsa": {"value": round(tpsa, 2), "limit": 140.0, "passed": tpsa <= 140.0, "unit": "Å²", "name": "TPSA"}
    }
    veber_violations = sum(1 for item in veber_checks.values() if not item["passed"])
    
    # Lead-likeness / Drug-likeness classification
    if lipinski_violations == 0 and veber_violations == 0:
        drug_likeness_class = "Highly Drug-Like (0 Violations)"
        drug_likeness_status = "Pass"
    elif lipinski_violations <= 1 and veber_violations == 0:
        drug_likeness_class = "Acceptable Drug-Likeness (1 Lipinski Alert)"
        drug_likeness_status = "Moderate"
    else:
        drug_likeness_class = f"Low Drug-Likeness ({lipinski_violations} Lipinski, {veber_violations} Veber Violations)"
        drug_likeness_status = "Fail"
        
    return {
        "lipinski": lipinski_checks,
        "lipinski_violations": lipinski_violations,
        "lipinski_passed": lipinski_violations <= 1,
        "veber": veber_checks,
        "veber_violations": veber_violations,
        "veber_passed": veber_violations == 0,
        "drug_likeness_class": drug_likeness_class,
        "drug_likeness_status": drug_likeness_status,
        "extended": {
            "heavy_atoms": heavy_atoms,
            "rings": rings,
            "aromatic_rings": aromatic_rings,
            "fsp3": round(fsp3, 3),
            "molar_refractivity": round(molar_refractivity, 2),
            "chiral_centers_count": chiral_count,
            "chiral_centers": chiral_centers
        }
    }

def generate_2d_depictions(mol, img_size=(450, 400)):
    """
    Generates 4 distinct 2D depictions returned as base64 PNGs:
    1. Standard Skeletal / Line-Angle formula
    2. Stereochemical Wedge-and-Dash with chiral stereocenters highlighted
    3. Full Explicit Atom representation (explicit carbons & hydrogens)
    4. Bemis-Murcko scaffold extraction
    """
    depictions = {}
    w, h = img_size
    
    # Ensure 2D coordinates exist
    mol_2d = Chem.Mol(mol)
    AllChem.Compute2DCoords(mol_2d)
    
    # 1. Standard Skeletal
    drawer1 = rdMolDraw2D.MolDraw2DCairo(w, h)
    opts1 = drawer1.drawOptions()
    opts1.clearBackground = False
    opts1.bondLineWidth = 2.0
    drawer1.DrawMolecule(mol_2d)
    drawer1.FinishDrawing()
    depictions["skeletal"] = base64.b64encode(drawer1.GetDrawingText()).decode('utf-8')
    
    # 2. Stereochemical Wedge-and-Dash with chiral centers highlighted
    mol_stereo = Chem.Mol(mol_2d)
    Chem.AssignStereochemistry(mol_stereo, force=True, cleanIt=True)
    chiral_centers = Chem.FindMolChiralCenters(mol_stereo, includeUnassigned=True)
    chiral_atom_indices = [c[0] for c in chiral_centers]
    
    drawer2 = rdMolDraw2D.MolDraw2DCairo(w, h)
    opts2 = drawer2.drawOptions()
    opts2.clearBackground = False
    opts2.bondLineWidth = 2.0
    if chiral_atom_indices:
        highlight_colors = {idx: (0.9, 0.3, 0.2) for idx in chiral_atom_indices}
        drawer2.DrawMolecule(mol_stereo, highlightAtoms=chiral_atom_indices, highlightAtomColors=highlight_colors)
    else:
        drawer2.DrawMolecule(mol_stereo)
    drawer2.FinishDrawing()
    depictions["wedge_dash"] = base64.b64encode(drawer2.GetDrawingText()).decode('utf-8')
    depictions["chiral_atoms_count"] = len(chiral_atom_indices)
    
    # 3. Full Explicit Atom Representation (all carbons & implicit hydrogens explicit)
    mol_explicit = Chem.AddHs(mol)
    AllChem.Compute2DCoords(mol_explicit)
    drawer3 = rdMolDraw2D.MolDraw2DCairo(w, h)
    opts3 = drawer3.drawOptions()
    opts3.clearBackground = False
    opts3.explicitMethyl = True
    opts3.bondLineWidth = 1.8
    drawer3.DrawMolecule(mol_explicit)
    drawer3.FinishDrawing()
    depictions["explicit_atoms"] = base64.b64encode(drawer3.GetDrawingText()).decode('utf-8')
    
    # 4. Bemis-Murcko Scaffold Extraction
    try:
        scaffold = MurckoScaffold.GetScaffoldForMol(mol)
        if scaffold and scaffold.GetNumAtoms() > 0:
            AllChem.Compute2DCoords(scaffold)
            drawer4 = rdMolDraw2D.MolDraw2DCairo(w, h)
            opts4 = drawer4.drawOptions()
            opts4.clearBackground = False
            opts4.bondLineWidth = 2.0
            drawer4.DrawMolecule(scaffold)
            drawer4.FinishDrawing()
            depictions["murcko_scaffold"] = base64.b64encode(drawer4.GetDrawingText()).decode('utf-8')
            depictions["has_scaffold"] = True
            depictions["scaffold_smiles"] = Chem.MolToSmiles(scaffold)
        else:
            depictions["murcko_scaffold"] = None
            depictions["has_scaffold"] = False
            depictions["scaffold_smiles"] = "Acyclic (No ring scaffold)"
    except Exception:
        depictions["murcko_scaffold"] = None
        depictions["has_scaffold"] = False
        depictions["scaffold_smiles"] = "Scaffold extraction not applicable"
        
    return depictions

def generate_3d_conformer(mol):
    """
    Generates a 3D conformer using ETKDGv3, performs MMFF/UFF energy minimization,
    and calculates Gasteiger partial charges for electrostatic potential mapping.
    Includes defensive fallbacks if 3D embedding fails.
    """
    m3d = Chem.AddHs(mol)
    params = AllChem.ETKDGv3()
    params.randomSeed = 42
    params.useSmallRingTorsions = True
    
    is_3d = True
    optimization_method = "MMFF94"
    warning = None
    
    embed_code = AllChem.EmbedMolecule(m3d, params)
    if embed_code != 0:
        # Fallback to random coordinates
        embed_code = AllChem.EmbedMolecule(m3d, useRandomCoords=True, randomSeed=42)
        
    if embed_code == 0:
        # Try MMFF94 optimization
        try:
            mmff_props = AllChem.MMFFGetMoleculeProperties(m3d)
            if mmff_props is not None:
                AllChem.MMFFOptimizeMolecule(m3d, maxIters=500)
                optimization_method = "MMFF94 (Minimized)"
            else:
                AllChem.UFFOptimizeMolecule(m3d, maxIters=500)
                optimization_method = "UFF (Minimized)"
        except Exception:
            try:
                AllChem.UFFOptimizeMolecule(m3d, maxIters=500)
                optimization_method = "UFF (Minimized)"
            except Exception:
                optimization_method = "ETKDGv3 (Unminimized)"
    else:
        # Defensive fallback to 2D coordinates
        is_3d = False
        AllChem.Compute2DCoords(m3d)
        optimization_method = "2D Fallback Coordinates"
        warning = "3D conformer embedding failed due to geometric/steric constraints. 2D fallback coordinates supplied."
        
    # Calculate Gasteiger partial charges
    try:
        AllChem.ComputeGasteigerCharges(m3d)
    except Exception:
        pass
        
    charges = []
    atoms_data = []
    for atom in m3d.GetAtoms():
        charge = 0.0
        if atom.HasProp('_GasteigerCharge'):
            try:
                c = float(atom.GetDoubleProp('_GasteigerCharge'))
                if not (np.isnan(c) or np.isinf(c)):
                    charge = c
            except Exception:
                charge = 0.0
        charges.append(round(charge, 4))
        atoms_data.append({
            "idx": atom.GetIdx(),
            "element": atom.GetSymbol(),
            "charge": round(charge, 4)
        })
        
    molblock = Chem.MolToMolBlock(m3d)
    
    return {
        "molblock": molblock,
        "is_3d": is_3d,
        "optimization_method": optimization_method,
        "warning": warning,
        "num_atoms": m3d.GetNumAtoms(),
        "partial_charges": charges,
        "atoms": atoms_data,
        "charge_min": min(charges) if charges else -0.5,
        "charge_max": max(charges) if charges else 0.5
    }

def generate_lipinski_radar_plot(props):
    """
    Generates a normalized Lipinski Rule of 5 and Veber radar / spider chart.
    Threshold limits are normalized to 1.0. Values > 1.0 represent rule boundaries exceeded.
    """
    lip = props["lipinski"]
    veb = props["veber"]
    
    categories = [
        'MW\n(≤500)',
        'MolLogP\n(≤5.0)',
        'HBD\n(≤5)',
        'HBA\n(≤10)',
        'TPSA\n(≤140)',
        'RotB\n(≤10)'
    ]
    
    raw_values = [
        lip["mw"]["value"],
        lip["logp"]["value"],
        lip["hbd"]["value"],
        lip["hba"]["value"],
        veb["tpsa"]["value"],
        veb["rotb"]["value"]
    ]
    
    limits = [500.0, 5.0, 5.0, 10.0, 140.0, 10.0]
    
    # Normalized against threshold: limit = 1.0
    normalized_values = []
    for val, lim in zip(raw_values, limits):
        v = float(val)
        if v < 0:
            norm = 0.05
        else:
            norm = v / lim
        normalized_values.append(min(norm, 1.8))  # Cap at 1.8 for visual clarity
        
    N = len(categories)
    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    angles += angles[:1]
    
    plot_vals = normalized_values + normalized_values[:1]
    threshold_polygon = [1.0] * (N + 1)
    
    fig, ax = plt.subplots(figsize=(4.5, 4.5), subplot_kw=dict(polar=True), dpi=160)
    ax.set_facecolor('none')
    fig.patch.set_facecolor('none')
    
    ax.set_theta_offset(np.pi / 2)
    ax.set_theta_direction(-1)
    
    plt.xticks(angles[:-1], categories, color="#334155", size=8.5, weight="bold")
    ax.set_rlabel_position(30)
    plt.yticks([0.5, 1.0, 1.5], ["0.5x", "1.0x (Limit)", "1.5x"], color="#64748b", size=7.5)
    plt.ylim(0, 1.7)
    
    # Grid lines styling
    ax.grid(color="#cbd5e1", linestyle="--", linewidth=0.7)
    
    # Reference boundary (Limit = 1.0)
    ax.plot(angles, threshold_polygon, color='#ef4444', linewidth=1.8, linestyle='--', label='Lipinski/Veber Limit')
    ax.fill(angles, threshold_polygon, color='#ef4444', alpha=0.06)
    
    # Compound values polygon
    is_compliant = props["lipinski_passed"] and props["veber_passed"]
    poly_color = '#10b981' if is_compliant else '#f59e0b'
    ax.plot(angles, plot_vals, color=poly_color, linewidth=2.4, linestyle='solid', label='Compound Profile')
    ax.fill(angles, plot_vals, color=poly_color, alpha=0.28)
    
    # Draw points on vertices
    ax.scatter(angles[:-1], normalized_values, color=poly_color, s=28, zorder=5)
    
    ax.legend(loc='upper right', bbox_to_anchor=(1.25, 1.12), fontsize=7.5, frameon=True, facecolor='white', edgecolor='#e2e8f0')
    
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format='png', dpi=160, bbox_inches='tight', transparent=True)
    plt.close(fig)
    
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode('utf-8'), buf.getvalue()

def analyze_molecule_pipeline(query: str):
    """
    Main orchestration routine resolving query, calculating properties,
    generating 2D depictions, 3D conformer, and Lipinski radar plot.
    """
    mol, metadata = resolve_molecule(query)
    properties = calculate_physicochemical_properties(mol)
    depictions = generate_2d_depictions(mol)
    conformer_3d = generate_3d_conformer(mol)
    radar_b64, radar_png_bytes = generate_lipinski_radar_plot(properties)
    
    return {
        "metadata": metadata,
        "properties": properties,
        "depictions": depictions,
        "conformer_3d": conformer_3d,
        "radar_b64": radar_b64,
        "radar_png_bytes": radar_png_bytes
    }

import io
import base64
from datetime import datetime
from typing import Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    KeepTogether,
    HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def create_dossier_pdf(data: Dict[str, Any]) -> bytes:
    """
    Builds a publication-ready Drug-Likeness & Molecular Dossier PDF
    with Virtual Lab styling using ReportLab Platypus.
    """
    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=32,
        bottomMargin=32
    )
    
    styles = getSampleStyleSheet()
    
    header_title_style = ParagraphStyle(
        'DocHeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        alignment=TA_LEFT
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#475569'),
        alignment=TA_LEFT
    )
    
    section_heading = ParagraphStyle(
        'DocSection',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0f766e'),
        spaceBefore=7,
        spaceAfter=4
    )
    
    body_bold = ParagraphStyle(
        'DocBodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#0f172a')
    )
    
    body_normal = ParagraphStyle(
        'DocBodyNormal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#334155')
    )
    
    body_center = ParagraphStyle(
        'DocBodyCenter',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#334155')
    )
    
    pass_badge_style = ParagraphStyle(
        'PassBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#059669')
    )
    
    fail_badge_style = ParagraphStyle(
        'FailBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#dc2626')
    )
    
    metadata = data.get("metadata", {})
    properties = data.get("properties", {})
    depictions = data.get("depictions", {})
    lip = properties.get("lipinski", {})
    veb = properties.get("veber", {})
    ghose = properties.get("ghose", {})
    ext = properties.get("extended", {})
    mfp = properties.get("morgan_fp", {})
    safety = metadata.get("safety", {})
    
    compound_name = metadata.get("name", "Target Molecule")
    cid = metadata.get("cid") or "N/A"
    cas = metadata.get("cas") or "N/A"
    formula = metadata.get("formula", "N/A")
    iupac = metadata.get("iupac_name") or "Not Specified"
    smiles = metadata.get("smiles", "")
    inchikey = metadata.get("inchikey") or "N/A"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    story = []
    
    # 1. Header Section
    header_data = [
        [
            Paragraph("<b>CHEMINFORMATICS VIRTUAL LAB DOSSIER</b>", header_title_style),
            Paragraph(f"<b>Generated:</b> {now_str}<br/><b>Engine:</b> RDKit 2024 / PubChem PUG REST", ParagraphStyle('HRight', parent=subtitle_style, alignment=TA_RIGHT))
        ]
    ]
    header_table = Table(header_data, colWidths=[350, 190])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0d9488'), spaceBefore=5, spaceAfter=8))
    
    # 2. Compound Overview Table
    overview_data = [
        [
            Paragraph("<b>Compound Name:</b>", body_bold),
            Paragraph(f"<b>{compound_name}</b>", body_normal),
            Paragraph("<b>Formula:</b>", body_bold),
            Paragraph(f"<b>{formula}</b>", body_normal),
        ],
        [
            Paragraph("<b>PubChem CID:</b>", body_bold),
            Paragraph(f"{cid}", body_normal),
            Paragraph("<b>CAS Number:</b>", body_bold),
            Paragraph(f"{cas}", body_normal),
        ],
        [
            Paragraph("<b>IUPAC Name:</b>", body_bold),
            Paragraph(f"{iupac[:75]}..." if len(iupac) > 75 else iupac, body_normal),
            Paragraph("<b>InChIKey:</b>", body_bold),
            Paragraph(f"{inchikey}", body_normal),
        ],
        [
            Paragraph("<b>Canonical SMILES:</b>", body_bold),
            Paragraph(f"<font name='Courier'>{smiles[:85]}...</font>" if len(smiles) > 85 else f"<font name='Courier'>{smiles}</font>", body_normal),
            Paragraph("<b>Verdict:</b>", body_bold),
            Paragraph(f"<b>{properties.get('drug_likeness_class', 'N/A')}</b>", body_normal),
        ]
    ]
    
    overview_table = Table(overview_data, colWidths=[95, 205, 80, 160])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 8))
    
    # 3. Visuals: 2D Depiction & Radar Chart Side-by-Side
    struct_img_flowable = None
    radar_img_flowable = None
    
    # 2D Structure image
    if depictions.get("skeletal"):
        try:
            png_bytes = base64.b64decode(depictions["skeletal"])
            struct_buf = io.BytesIO(png_bytes)
            struct_img_flowable = RLImage(struct_buf, width=200, height=160)
        except Exception:
            pass
            
    # Radar chart image
    if data.get("radar_png_bytes"):
        try:
            radar_buf = io.BytesIO(data["radar_png_bytes"])
            radar_img_flowable = RLImage(radar_buf, width=200, height=160)
        except Exception:
            pass
    elif data.get("radar_b64"):
        try:
            png_bytes = base64.b64decode(data["radar_b64"])
            radar_buf = io.BytesIO(png_bytes)
            radar_img_flowable = RLImage(radar_buf, width=200, height=160)
        except Exception:
            pass
            
    if struct_img_flowable or radar_img_flowable:
        visuals_data = [
            [
                Paragraph("<b>2D Chemical Structure (RDKit)</b>", body_center),
                Paragraph("<b>Oral Bioavailability Radar (Normalized)</b>", body_center)
            ],
            [
                struct_img_flowable if struct_img_flowable else Paragraph("2D Structure N/A", body_center),
                radar_img_flowable if radar_img_flowable else Paragraph("Radar Chart N/A", body_center)
            ]
        ]
        visuals_table = Table(visuals_data, colWidths=[270, 270])
        visuals_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
            ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(visuals_table)
        story.append(Spacer(1, 8))
        
    # 4. Rules Matrix: Lipinski Rule of 5 & Veber Rules
    story.append(Paragraph("<b>Physicochemical Profiling & Lipinski / Veber Compliance</b>", section_heading))
    
    rules_table_data = [
        [
            Paragraph("<b>Descriptor / Rule</b>", body_bold),
            Paragraph("<b>Target Limit</b>", body_bold),
            Paragraph("<b>Calculated Value</b>", body_bold),
            Paragraph("<b>Status</b>", body_bold),
            Paragraph("<b>Cheminformatics Criterion</b>", body_bold)
        ],
        [
            Paragraph("Molecular Weight (MW)", body_normal),
            Paragraph("≤ 500.0 g/mol", body_normal),
            Paragraph(f"{lip.get('mw', {}).get('value', 'N/A')} g/mol", body_normal),
            Paragraph("PASS" if lip.get('mw', {}).get('passed') else "ALERT", pass_badge_style if lip.get('mw', {}).get('passed') else fail_badge_style),
            Paragraph("Lipinski Ro5: Intestinal absorption threshold", body_normal)
        ],
        [
            Paragraph("MolLogP (Octanol/Water)", body_normal),
            Paragraph("≤ 5.0", body_normal),
            Paragraph(f"{lip.get('logp', {}).get('value', 'N/A')}", body_normal),
            Paragraph("PASS" if lip.get('logp', {}).get('passed') else "ALERT", pass_badge_style if lip.get('logp', {}).get('passed') else fail_badge_style),
            Paragraph("Lipinski Ro5: Lipophilicity / permeability", body_normal)
        ],
        [
            Paragraph("H-Bond Donors (HBD)", body_normal),
            Paragraph("≤ 5", body_normal),
            Paragraph(f"{lip.get('hbd', {}).get('value', 'N/A')}", body_normal),
            Paragraph("PASS" if lip.get('hbd', {}).get('passed') else "ALERT", pass_badge_style if lip.get('hbd', {}).get('passed') else fail_badge_style),
            Paragraph("Lipinski Ro5: Hydrogen bonding capacity", body_normal)
        ],
        [
            Paragraph("H-Bond Acceptors (HBA)", body_normal),
            Paragraph("≤ 10", body_normal),
            Paragraph(f"{lip.get('hba', {}).get('value', 'N/A')}", body_normal),
            Paragraph("PASS" if lip.get('hba', {}).get('passed') else "ALERT", pass_badge_style if lip.get('hba', {}).get('passed') else fail_badge_style),
            Paragraph("Lipinski Ro5: Hydrogen bonding capacity", body_normal)
        ],
        [
            Paragraph("Rotatable Bonds (RotB)", body_normal),
            Paragraph("≤ 10", body_normal),
            Paragraph(f"{veb.get('rotb', {}).get('value', 'N/A')}", body_normal),
            Paragraph("PASS" if veb.get('rotb', {}).get('passed') else "ALERT", pass_badge_style if veb.get('rotb', {}).get('passed') else fail_badge_style),
            Paragraph("Veber Rule: Molecular conformational flexibility", body_normal)
        ],
        [
            Paragraph("Topological PSA (TPSA)", body_normal),
            Paragraph("≤ 140.0 Å²", body_normal),
            Paragraph(f"{veb.get('tpsa', {}).get('value', 'N/A')} Å²", body_normal),
            Paragraph("PASS" if veb.get('tpsa', {}).get('passed') else "ALERT", pass_badge_style if veb.get('tpsa', {}).get('passed') else fail_badge_style),
            Paragraph("Veber Rule: Epithelial cell permeation", body_normal)
        ]
    ]
    
    rules_table = Table(rules_table_data, colWidths=[125, 80, 85, 60, 190])
    rules_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f766e')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(rules_table)
    story.append(Spacer(1, 8))
    
    # 5. Ghose Filter & Extended Descriptors Side-by-Side
    story.append(Paragraph("<b>Ghose Drug-Likeness Filter & Extended Topology</b>", section_heading))
    
    ghose_ext_data = [
        [
            Paragraph("<b>Ghose Filter Property</b>", body_bold),
            Paragraph("<b>Limit</b>", body_bold),
            Paragraph("<b>Value</b>", body_bold),
            Paragraph("<b>Status</b>", body_bold),
            Paragraph("<b>Structural Metric</b>", body_bold),
            Paragraph("<b>Value</b>", body_bold)
        ],
        [
            Paragraph("Ghose LogP", body_normal),
            Paragraph("-0.4 to 5.6", body_normal),
            Paragraph(f"{ghose.get('logp', {}).get('value', 'N/A')}", body_normal),
            Paragraph("PASS" if ghose.get('logp', {}).get('passed') else "ALERT", pass_badge_style if ghose.get('logp', {}).get('passed') else fail_badge_style),
            Paragraph("Heavy Atom Count", body_normal),
            Paragraph(f"{ext.get('heavy_atoms', 'N/A')}", body_normal)
        ],
        [
            Paragraph("Ghose MW", body_normal),
            Paragraph("160 to 480", body_normal),
            Paragraph(f"{ghose.get('mw', {}).get('value', 'N/A')}", body_normal),
            Paragraph("PASS" if ghose.get('mw', {}).get('passed') else "ALERT", pass_badge_style if ghose.get('mw', {}).get('passed') else fail_badge_style),
            Paragraph("Aromatic / Total Rings", body_normal),
            Paragraph(f"{ext.get('aromatic_rings', 0)} / {ext.get('rings', 0)}", body_normal)
        ],
        [
            Paragraph("Molar Refractivity", body_normal),
            Paragraph("40 to 130", body_normal),
            Paragraph(f"{ghose.get('mr', {}).get('value', 'N/A')}", body_normal),
            Paragraph("PASS" if ghose.get('mr', {}).get('passed') else "ALERT", pass_badge_style if ghose.get('mr', {}).get('passed') else fail_badge_style),
            Paragraph("Fraction Csp3 (Fsp3)", body_normal),
            Paragraph(f"{ext.get('fsp3', 'N/A')}", body_normal)
        ],
        [
            Paragraph("Heavy Atom Count", body_normal),
            Paragraph("20 to 70", body_normal),
            Paragraph(f"{ghose.get('atoms', {}).get('value', 'N/A')}", body_normal),
            Paragraph("PASS" if ghose.get('atoms', {}).get('passed') else "ALERT", pass_badge_style if ghose.get('atoms', {}).get('passed') else fail_badge_style),
            Paragraph("Chiral Centers (Stereo)", body_normal),
            Paragraph(f"{ext.get('chiral_centers_count', 0)} centers", body_normal)
        ]
    ]
    
    ghose_ext_table = Table(ghose_ext_data, colWidths=[100, 65, 55, 50, 150, 120])
    ghose_ext_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0284c7')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(ghose_ext_table)
    story.append(Spacer(1, 8))
    
    # 6. Morgan Fingerprint & GHS Safety Section
    story.append(Paragraph("<b>Cheminformatics Fingerprints & PubChem GHS Safety Flags</b>", section_heading))
    
    mfp_bits = mfp.get('on_bits_count', 0)
    mfp_density = mfp.get('bit_density', 0.0)
    
    ghs_pics = safety.get('pictograms', [])
    ghs_text = ", ".join([p.get('name', '') for p in ghs_pics]) if ghs_pics else "No GHS pictograms reported on PubChem"
    hazard_stmts = safety.get('hazard_statements', [])
    hazard_preview = "; ".join(hazard_stmts[:3]) if hazard_stmts else "Standard laboratory handling precautions apply"
    
    safety_summary_data = [
        [
            Paragraph("<b>Morgan Fingerprint:</b>", body_bold),
            Paragraph(f"ECFP4 Equivalent (Radius 2, 1024-bit). Active Bits: <b>{mfp_bits}</b> / 1024 ({mfp_density*100:.2f}% bit density)", body_normal),
        ],
        [
            Paragraph("<b>GHS Hazard Pictograms:</b>", body_bold),
            Paragraph(f"<b>{ghs_text}</b>", body_normal),
        ],
        [
            Paragraph("<b>PubChem Bioassays:</b>", body_bold),
            Paragraph(f"Total Tested Assays: <b>{safety.get('bioassays_count', 0)}</b> | Active Assays: <b>{safety.get('active_bioassays_count', 0)}</b>", body_normal),
        ],
        [
            Paragraph("<b>Hazard Statements:</b>", body_bold),
            Paragraph(f"{hazard_preview}", body_normal),
        ]
    ]
    
    safety_table = Table(safety_summary_data, colWidths=[130, 410])
    safety_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(safety_table)
    story.append(Spacer(1, 10))
    
    # 7. Footer
    story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#cbd5e1'), spaceBefore=2, spaceAfter=4))
    footer_text = "<b>Scientific Methodology:</b> Lipinski CA et al. (1997) Adv Drug Deliv Rev; Veber DF et al. (2002) J Med Chem; Ghose AK et al. (1999) J Comb Chem; RDKit MMFF94 force field. Generated via Cheminformatics Virtual Lab Web Suite."
    story.append(Paragraph(footer_text, ParagraphStyle('FooterStyle', parent=styles['Normal'], fontName='Helvetica', fontSize=6.5, leading=8.5, textColor=colors.HexColor('#64748b'), alignment=TA_CENTER)))
    
    doc.build(story)
    pdf_buffer.seek(0)
    return pdf_buffer.getvalue()

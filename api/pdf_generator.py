import io
import base64
from datetime import datetime

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

def create_dossier_pdf(data: dict) -> bytes:
    """
    Builds a publication-ready Drug-Likeness & Lipinski Dossier PDF
    using ReportLab Platypus and in-memory IO buffers.
    """
    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    header_title_style = ParagraphStyle(
        'DocHeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        alignment=TA_LEFT
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#475569'),
        alignment=TA_LEFT
    )
    
    section_heading = ParagraphStyle(
        'DocSection',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=10,
        spaceAfter=6
    )
    
    body_bold = ParagraphStyle(
        'DocBodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor('#0f172a')
    )
    
    body_normal = ParagraphStyle(
        'DocBodyNormal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#334155')
    )
    
    body_center = ParagraphStyle(
        'DocBodyCenter',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#334155')
    )
    
    pass_badge_style = ParagraphStyle(
        'PassBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#15803d')
    )
    
    fail_badge_style = ParagraphStyle(
        'FailBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#b91c1c')
    )
    
    metadata = data.get("metadata", {})
    properties = data.get("properties", {})
    depictions = data.get("depictions", {})
    lip = properties.get("lipinski", {})
    veb = properties.get("veber", {})
    ext = properties.get("extended", {})
    
    compound_name = metadata.get("name", "Unknown Compound")
    cid = metadata.get("cid", "N/A")
    formula = metadata.get("formula", "N/A")
    iupac = metadata.get("iupac_name") or "Not Specified"
    smiles = metadata.get("smiles", "")
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    story = []
    
    # 1. Header Section
    header_data = [
        [
            Paragraph("<b>DRUG-LIKENESS & LIPINSKI DOSSIER</b>", header_title_style),
            Paragraph(f"<b>Generated:</b> {now_str}<br/><b>Engine:</b> RDKit / PubChem / ReportLab", ParagraphStyle('HRight', parent=subtitle_style, alignment=TA_RIGHT))
        ]
    ]
    header_table = Table(header_data, colWidths=[360, 180])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563eb'), spaceBefore=4, spaceAfter=8))
    
    # 2. Executive Summary Banner
    verdict_text = properties.get("drug_likeness_class", "Profiling Complete")
    is_pass = properties.get("lipinski_passed", True) and properties.get("veber_passed", True)
    banner_bg = colors.HexColor('#dcfce7') if is_pass else colors.HexColor('#fef3c7')
    banner_border = colors.HexColor('#16a34a') if is_pass else colors.HexColor('#d97706')
    banner_text_color = '#15803d' if is_pass else '#b45309'
    
    banner_p = Paragraph(
        f"<b>Verdict:</b> {verdict_text} | <b>Lipinski Rule of 5:</b> {'PASSED' if properties.get('lipinski_passed') else 'FAILED'} ({properties.get('lipinski_violations', 0)} Violations) | <b>Veber:</b> {'PASSED' if properties.get('veber_passed') else 'FAILED'}",
        ParagraphStyle('Banner', parent=body_bold, fontSize=9.5, leading=13, textColor=colors.HexColor(banner_text_color))
    )
    banner_table = Table([[banner_p]], colWidths=[540])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), banner_bg),
        ('BOX', (0, 0), (-1, -1), 1, banner_border),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 8))
    
    # 3. Metadata Table
    meta_table_data = [
        [
            Paragraph("<b>Compound Name:</b>", body_bold), Paragraph(str(compound_name), body_normal),
            Paragraph("<b>PubChem CID:</b>", body_bold), Paragraph(str(cid), body_normal)
        ],
        [
            Paragraph("<b>Formula:</b>", body_bold), Paragraph(str(formula), body_normal),
            Paragraph("<b>Canonical SMILES:</b>", body_bold), Paragraph(f"<font size=7>{smiles[:38] + '...' if len(smiles) > 40 else smiles}</font>", body_normal)
        ],
        [
            Paragraph("<b>IUPAC Name:</b>", body_bold), Paragraph(f"<font size=7>{iupac[:65] + '...' if len(iupac) > 65 else iupac}</font>", body_normal),
            Paragraph("<b>Heavy Atoms:</b>", body_bold), Paragraph(str(ext.get("heavy_atoms", "N/A")), body_normal)
        ]
    ]
    meta_table = Table(meta_table_data, colWidths=[95, 185, 95, 165])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#f1f5f9')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))
    
    # 4. Physicochemical Profile Table (Lipinski & Veber Criteria)
    story.append(Paragraph("Physicochemical Profiling & Rule Compliance", section_heading))
    
    prop_rows = [
        [
            Paragraph("<b>Rule Set</b>", body_bold),
            Paragraph("<b>Descriptor</b>", body_bold),
            Paragraph("<b>Calculated Value</b>", body_bold),
            Paragraph("<b>Drug-Like Cutoff</b>", body_bold),
            Paragraph("<b>Status</b>", ParagraphStyle('HCenter', parent=body_bold, alignment=TA_CENTER))
        ]
    ]
    
    rules_data = [
        ("Lipinski", "Molecular Weight (MW)", f"{lip.get('mw', {}).get('value', 0)} g/mol", "≤ 500.0 g/mol", lip.get('mw', {}).get('passed', True)),
        ("Lipinski", "MolLogP (Octanol/Water)", f"{lip.get('logp', {}).get('value', 0)}", "≤ 5.0", lip.get('logp', {}).get('passed', True)),
        ("Lipinski", "H-Bond Donors (HBD)", f"{lip.get('hbd', {}).get('value', 0)}", "≤ 5", lip.get('hbd', {}).get('passed', True)),
        ("Lipinski", "H-Bond Acceptors (HBA)", f"{lip.get('hba', {}).get('value', 0)}", "≤ 10", lip.get('hba', {}).get('passed', True)),
        ("Veber", "Topological Polar Surface Area (TPSA)", f"{veb.get('tpsa', {}).get('value', 0)} Å²", "≤ 140.0 Å²", veb.get('tpsa', {}).get('passed', True)),
        ("Veber", "Rotatable Bonds Count", f"{veb.get('rotb', {}).get('value', 0)}", "≤ 10", veb.get('rotb', {}).get('passed', True)),
    ]
    
    table_styles = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]
    
    for idx, (rset, dname, val, cutoff, passed) in enumerate(rules_data, start=1):
        status_p = Paragraph("PASS", pass_badge_style) if passed else Paragraph("ALERT", fail_badge_style)
        status_bg = colors.HexColor('#ecfdf5') if passed else colors.HexColor('#fef2f2')
        table_styles.append(('BACKGROUND', (4, idx), (4, idx), status_bg))
        prop_rows.append([
            Paragraph(f"<font color='#64748b'>{rset}</font>", body_normal),
            Paragraph(dname, body_normal),
            Paragraph(f"<b>{val}</b>", body_normal),
            Paragraph(cutoff, body_normal),
            status_p
        ])
        
    prop_table = Table(prop_rows, colWidths=[70, 190, 110, 100, 70])
    prop_table.setStyle(TableStyle(table_styles))
    story.append(prop_table)
    story.append(Spacer(1, 10))
    
    # 5. Visualizations Panel: Skeletal, Murcko Scaffold, and Radar Chart
    story.append(Paragraph("Molecular Architecture & Lipinski Radar Representation", section_heading))
    
    # Prepare Image Flowables from base64
    skeletal_b64 = depictions.get("skeletal")
    scaffold_b64 = depictions.get("murcko_scaffold")
    radar_b64 = data.get("radar_b64")
    
    img_cells = []
    
    # Skeletal formula
    if skeletal_b64:
        skeletal_bytes = base64.b64decode(skeletal_b64)
        skeletal_img = RLImage(io.BytesIO(skeletal_bytes), width=165, height=140)
        img_cells.append([skeletal_img, Paragraph("<b>2D Skeletal Formula</b><br/><font color='#64748b' size=7>Standard Line-Angle</font>", body_center)])
    else:
        img_cells.append([Paragraph("Image not available", body_center), Paragraph("Skeletal Formula", body_center)])
        
    # Murcko Scaffold
    if scaffold_b64:
        scaffold_bytes = base64.b64decode(scaffold_b64)
        scaffold_img = RLImage(io.BytesIO(scaffold_bytes), width=165, height=140)
        img_cells.append([scaffold_img, Paragraph("<b>Bemis-Murcko Scaffold</b><br/><font color='#64748b' size=7>Ring Framework</font>", body_center)])
    else:
        img_cells.append([Paragraph("<i>Acyclic / No ring scaffold</i>", body_center), Paragraph("<b>Bemis-Murcko Scaffold</b><br/><font color='#64748b' size=7>Acyclic Molecule</font>", body_center)])
        
    # Radar plot
    if radar_b64:
        radar_bytes = base64.b64decode(radar_b64)
        radar_img = RLImage(io.BytesIO(radar_bytes), width=165, height=140)
        img_cells.append([radar_img, Paragraph("<b>Lipinski Radar Profile</b><br/><font color='#64748b' size=7>Normalized to 1.0 Limit</font>", body_center)])
    else:
        img_cells.append([Paragraph("Chart not available", body_center), Paragraph("Radar Plot", body_center)])
        
    fig_table_data = [
        [img_cells[0][0], img_cells[1][0], img_cells[2][0]],
        [img_cells[0][1], img_cells[1][1], img_cells[2][1]]
    ]
    fig_table = Table(fig_table_data, colWidths=[180, 180, 180])
    fig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#ffffff')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(fig_table)
    story.append(Spacer(1, 10))
    
    # 6. Structural & Stereochemical Notes
    story.append(Paragraph("Stereochemical & Structural Properties", section_heading))
    chiral_count = ext.get("chiral_centers_count", 0)
    chiral_details = ", ".join([f"Atom {c[0]} ({c[1]})" for c in ext.get("chiral_centers", [])]) if chiral_count > 0 else "None (Achiral)"
    
    notes_data = [
        [
            Paragraph("<b>Chiral Stereocenters:</b>", body_bold), Paragraph(f"{chiral_count} ({chiral_details})", body_normal),
            Paragraph("<b>Fraction Csp3:</b>", body_bold), Paragraph(str(ext.get("fsp3", "N/A")), body_normal)
        ],
        [
            Paragraph("<b>Total Ring Count:</b>", body_bold), Paragraph(str(ext.get("rings", 0)), body_normal),
            Paragraph("<b>Aromatic Rings:</b>", body_bold), Paragraph(str(ext.get("aromatic_rings", 0)), body_normal)
        ],
        [
            Paragraph("<b>Molar Refractivity:</b>", body_bold), Paragraph(f"{ext.get('molar_refractivity', 'N/A')} m³/mol", body_normal),
            Paragraph("<b>Scaffold SMILES:</b>", body_bold), Paragraph(f"<font size=7>{depictions.get('scaffold_smiles', 'N/A')}</font>", body_normal)
        ]
    ]
    notes_table = Table(notes_data, colWidths=[120, 160, 110, 150])
    notes_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#f1f5f9')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(notes_table)
    story.append(Spacer(1, 10))
    
    # 7. Footnote and Methodology
    footnote = (
        "<b>Methodology Notes:</b> Lipinski's Rule of 5 predicts oral bioavailability for small molecule drug candidates. "
        "Veber's rules evaluate conformational flexibility (RotB ≤ 10) and polarity (TPSA ≤ 140 Å²). "
        "Generated computationally via RDKit (2024/2025 Release) and PubChem API. Designed for research and evaluation purposes."
    )
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceBefore=4, spaceAfter=4))
    story.append(Paragraph(footnote, ParagraphStyle('Footnote', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=7.5, leading=9.5, textColor=colors.HexColor('#64748b'))))
    
    doc.build(story)
    pdf_buffer.seek(0)
    return pdf_buffer.getvalue()

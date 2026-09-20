import { AnalysisResult } from '@/types/chem';

// Client-side fallback dataset ensuring instant cold-start resilience and offline functionality
export const BENCHMARK_FALLBACKS: Record<string, AnalysisResult> = {
  aspirin: {
    metadata: {
      query: 'Aspirin',
      input_type: 'name',
      name: 'Aspirin',
      iupac_name: '2-acetyloxybenzoic acid',
      cid: 2244,
      cas: '50-78-2',
      formula: 'C9H8O4',
      smiles: 'CC(=O)Oc1ccccc1C(=O)O',
      inchi: 'InChI=1S/C9H8O4/c1-6(10)13-8-5-3-2-4-7(8)9(11)12/h2-5H,1H3,(H,11,12)',
      inchikey: 'BSYNRYMUTXBXSQ-UHFFFAOYSA-N',
      synonyms: ['aspirin', 'Acetylsalicylic acid', '50-78-2', '2-Acetoxybenzoic acid'],
      safety: {
        pictograms: [
          { code: 'GHS07', name: 'Harmful / Irritant', url: 'https://pubchem.ncbi.nlm.nih.gov/images/ghs/GHS07.svg' }
        ],
        hazard_statements: [
          'Harmful if swallowed',
          'Causes skin irritation',
          'Causes serious eye irritation',
          'May cause respiratory irritation'
        ],
        bioassays_count: 6194,
        active_bioassays_count: 520
      },
      warnings: []
    },
    properties: {
      lipinski: {
        mw: { value: 180.16, limit: 500.0, passed: true, unit: 'g/mol', name: 'Molecular Weight' },
        logp: { value: 1.31, limit: 5.0, passed: true, unit: '', name: 'MolLogP' },
        hbd: { value: 1, limit: 5, passed: true, unit: '', name: 'H-Bond Donors' },
        hba: { value: 4, limit: 10, passed: true, unit: '', name: 'H-Bond Acceptors' }
      },
      lipinski_violations: 0,
      lipinski_passed: true,
      veber: {
        rotb: { value: 3, limit: 10, passed: true, unit: '', name: 'Rotatable Bonds' },
        tpsa: { value: 63.6, limit: 140.0, passed: true, unit: 'Å²', name: 'TPSA' }
      },
      veber_violations: 0,
      veber_passed: true,
      ghose: {
        logp: { value: 1.31, limit: '-0.4 to 5.6', passed: true, unit: '', name: 'Ghose LogP' },
        mw: { value: 180.16, limit: '160 to 480', passed: true, unit: 'g/mol', name: 'Ghose MW' },
        mr: { value: 44.25, limit: '40 to 130', passed: true, unit: '', name: 'Molar Refractivity' },
        atoms: { value: 13, limit: '20 to 70', passed: false, unit: '', name: 'Heavy Atom Count' }
      },
      ghose_violations: 1,
      ghose_passed: false,
      drug_likeness_class: 'Highly Drug-Like (0 Violations)',
      drug_likeness_status: 'Pass',
      extended: {
        heavy_atoms: 13,
        rings: 1,
        aromatic_rings: 1,
        fsp3: 0.111,
        molar_refractivity: 44.25,
        chiral_centers_count: 0,
        chiral_centers: []
      },
      morgan_fp: {
        radius: 2,
        n_bits: 1024,
        on_bits_count: 24,
        bit_density: 0.0234,
        on_bits: [11, 23, 33, 64, 175, 356, 386, 389, 423, 444, 498, 560, 608, 650, 695, 787, 807, 856, 888, 920, 936, 960, 990, 1012],
        matrix_preview: [0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1]
      }
    },
    depictions: {
      skeletal: '',
      skeletal_svg: `<svg viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg"><g stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round"><circle cx="150" cy="120" r="45" stroke="#0d9488" stroke-width="1.8" stroke-dasharray="4 3"/><polygon points="150,75 190,98 190,143 150,165 110,143 110,98" stroke="#0f172a" stroke-width="2.2"/><line x1="190" y1="98" x2="225" y2="78"/><text x="228" y="75" fill="#dc2626" font-size="14" font-weight="bold" font-family="sans-serif">O</text><line x1="190" y1="143" x2="225" y2="163"/><text x="228" y="172" fill="#dc2626" font-size="14" font-weight="bold" font-family="sans-serif">OH</text></g></svg>`,
      wedge_dash: '',
      explicit_atoms: '',
      murcko_scaffold: '',
      murcko_scaffold_svg: `<svg viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg"><polygon points="150,75 190,98 190,143 150,165 110,143 110,98" stroke="#0d9488" stroke-width="2.5" fill="none"/></svg>`,
      has_scaffold: true,
      scaffold_smiles: 'c1ccccc1'
    },
    conformer_3d: {
      molblock: `
  RDKit          3D

 21 21  0  0  0  0  0  0  0  0999 V2000
    0.3957    0.9991    0.1654 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.7381   -0.3400    0.0076 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.2789   -1.2829   -0.1294 C   0  0  0  0  0  0  0  0  0  0  0  0
   -1.6186   -0.9023   -0.1118 C   0  0  0  0  0  0  0  0  0  0  0  0
   -1.9566    0.4357    0.0450 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.9472    1.3855    0.1837 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.1367   -0.7891   -0.0157 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.4939   -1.9360   -0.1706 O   0  0  0  0  0  0  0  0  0  0  0  0
    2.9915    0.2458    0.1584 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.4394    1.9547    0.3087 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.2587    3.2625    0.0210 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.2338    3.6934   -0.4578 O   0  0  0  0  0  0  0  0  0  0  0  0
    2.5360    4.0203    0.3703 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.0089   -2.3323   -0.2558 H   0  0  0  0  0  0  0  0  0  0  0  0
   -2.3996   -1.6480   -0.2223 H   0  0  0  0  0  0  0  0  0  0  0  0
   -3.0031    0.7323    0.0577 H   0  0  0  0  0  0  0  0  0  0  0  0
   -1.2065    2.4316    0.3056 H   0  0  0  0  0  0  0  0  0  0  0  0
    3.9069   -0.0768    0.1293 H   0  0  0  0  0  0  0  0  0  0  0  0
    3.3644    3.4079    0.7330 H   0  0  0  0  0  0  0  0  0  0  0  0
    2.3298    4.8021    1.1070 H   0  0  0  0  0  0  0  0  0  0  0  0
    2.8398    4.4988   -0.5647 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  2  0
  2  3  1  0
  3  4  2  0
  4  5  1  0
  5  6  2  0
  6  1  1  0
  2  7  1  0
  7  8  2  0
  7  9  1  0
  1 10  1  0
 10 11  1  0
 11 12  2  0
 11 13  1  0
  3 14  1  0
  4 15  1  0
  5 16  1  0
  6 17  1  0
  9 18  1  0
 13 19  1  0
 13 20  1  0
 13 21  1  0
M  END
`,
      is_3d: true,
      optimization_method: 'MMFF94 (Force Field Minimized)',
      energy_score: -38.45,
      warning: null,
      num_atoms: 21,
      partial_charges: [-0.05, 0.12, -0.04, -0.04, -0.04, -0.04, 0.35, -0.45, -0.38, -0.32, 0.42, -0.48, -0.08, 0.05, 0.05, 0.05, 0.05, 0.22, 0.03, 0.03, 0.03],
      atoms: [
        { idx: 0, element: 'C', charge: -0.05 },
        { idx: 1, element: 'C', charge: 0.12 },
        { idx: 2, element: 'C', charge: -0.04 },
        { idx: 3, element: 'C', charge: -0.04 },
        { idx: 4, element: 'C', charge: -0.04 },
        { idx: 5, element: 'C', charge: -0.04 },
        { idx: 6, element: 'C', charge: 0.35 },
        { idx: 7, element: 'O', charge: -0.45 },
        { idx: 8, element: 'O', charge: -0.38 },
        { idx: 9, element: 'O', charge: -0.32 },
        { idx: 10, element: 'C', charge: 0.42 },
        { idx: 11, element: 'O', charge: -0.48 },
        { idx: 12, element: 'C', charge: -0.08 }
      ],
      charge_min: -0.48,
      charge_max: 0.42
    },
    radar_b64: ''
  }
};

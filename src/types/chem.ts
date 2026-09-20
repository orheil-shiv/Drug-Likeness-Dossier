export interface RuleCheck {
  value: number;
  limit: number;
  passed: boolean;
  unit: string;
  name: string;
}

export interface LipinskiChecks {
  mw: RuleCheck;
  logp: RuleCheck;
  hbd: RuleCheck;
  hba: RuleCheck;
}

export interface VeberChecks {
  rotb: RuleCheck;
  tpsa: RuleCheck;
}

export interface ExtendedMetrics {
  heavy_atoms: number;
  rings: number;
  aromatic_rings: number;
  fsp3: number;
  molar_refractivity: number;
  chiral_centers_count: number;
  chiral_centers: [number, string][];
}

export interface PropertiesData {
  lipinski: LipinskiChecks;
  lipinski_violations: number;
  lipinski_passed: boolean;
  veber: VeberChecks;
  veber_violations: number;
  veber_passed: boolean;
  drug_likeness_class: string;
  drug_likeness_status: 'Pass' | 'Moderate' | 'Fail';
  extended: ExtendedMetrics;
}

export interface Metadata {
  query: string;
  input_type: 'smiles' | 'name';
  name: string;
  iupac_name: string;
  cid: number | null;
  formula: string;
  smiles: string;
  warnings: string[];
}

export interface Depictions {
  skeletal: string;
  wedge_dash: string;
  chiral_atoms_count?: number;
  explicit_atoms: string;
  murcko_scaffold: string | null;
  has_scaffold: boolean;
  scaffold_smiles: string;
}

export interface AtomData {
  idx: number;
  element: string;
  charge: number;
}

export interface Conformer3D {
  molblock: string;
  is_3d: boolean;
  optimization_method: string;
  warning: string | null;
  num_atoms: number;
  partial_charges: number[];
  atoms: AtomData[];
  charge_min: number;
  charge_max: number;
}

export interface AnalysisResult {
  metadata: Metadata;
  properties: PropertiesData;
  depictions: Depictions;
  conformer_3d: Conformer3D;
  radar_b64: string;
}

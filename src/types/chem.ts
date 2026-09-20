export interface RuleCheck {
  value: number;
  limit: number | string;
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

export interface GhoseChecks {
  logp: RuleCheck;
  mw: RuleCheck;
  mr: RuleCheck;
  atoms: RuleCheck;
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

export interface MorganFingerprintData {
  radius: number;
  n_bits: number;
  on_bits_count: number;
  bit_density: number;
  on_bits: number[];
  matrix_preview: number[];
}

export interface GHSPictogram {
  code: string;
  name: string;
  url: string;
}

export interface SafetyData {
  pictograms: GHSPictogram[];
  hazard_statements: string[];
  bioassays_count?: number;
  active_bioassays_count?: number;
}

export interface PropertiesData {
  lipinski: LipinskiChecks;
  lipinski_violations: number;
  lipinski_passed: boolean;
  veber: VeberChecks;
  veber_violations: number;
  veber_passed: boolean;
  ghose: GhoseChecks;
  ghose_violations: number;
  ghose_passed: boolean;
  drug_likeness_class: string;
  drug_likeness_status: 'Pass' | 'Moderate' | 'Fail';
  extended: ExtendedMetrics;
  morgan_fp: MorganFingerprintData;
}

export interface Metadata {
  query: string;
  input_type: 'smiles' | 'name' | 'cas' | 'cid' | 'inchi';
  name: string;
  iupac_name: string;
  cid: number | null;
  cas?: string | null;
  formula: string;
  smiles: string;
  inchi?: string;
  inchikey?: string;
  synonyms?: string[];
  safety?: SafetyData;
  warnings: string[];
}

export interface Depictions {
  skeletal: string;
  skeletal_svg?: string;
  wedge_dash: string;
  wedge_dash_svg?: string;
  chiral_atoms_count?: number;
  explicit_atoms: string;
  explicit_atoms_svg?: string;
  murcko_scaffold: string | null;
  murcko_scaffold_svg?: string | null;
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
  unminimized_molblock?: string;
  is_3d: boolean;
  optimization_method: string;
  energy_score?: number | null;
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

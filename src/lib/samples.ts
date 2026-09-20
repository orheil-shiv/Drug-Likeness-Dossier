export interface SampleMolecule {
  name: string;
  category: string;
  query: string;
  type: 'name' | 'cas' | 'cid' | 'smiles' | 'inchi';
  description: string;
}

export const SAMPLE_MOLECULES: SampleMolecule[] = [
  {
    name: "Aspirin",
    category: "Name Search",
    query: "Aspirin",
    type: "name",
    description: "Classic acetylsalicylic acid analgesic. 0 Lipinski alerts."
  },
  {
    name: "CAS: 50-78-2",
    category: "CAS Registry",
    query: "50-78-2",
    type: "cas",
    description: "CAS registry lookup for Aspirin via PubChem."
  },
  {
    name: "CID: 2519",
    category: "PubChem CID",
    query: "2519",
    type: "cid",
    description: "PubChem Compound ID for Caffeine."
  },
  {
    name: "Ibuprofen SMILES",
    category: "SMILES Code",
    query: "CC(C)Cc1ccc(cc1)C(C)C(=O)O",
    type: "smiles",
    description: "Chiral propanoic acid derivative SMILES."
  },
  {
    name: "Penicillin V",
    category: "Antibiotic",
    query: "Penicillin V",
    type: "name",
    description: "Beta-lactam thiazolidine bicyclic core."
  },
  {
    name: "Atorvastatin",
    category: "Statin / Ro5 Border",
    query: "Atorvastatin",
    type: "name",
    description: "High molecular weight (MW 558.6) benchmark."
  },
  {
    name: "Remdesivir",
    category: "Antiviral",
    query: "Remdesivir",
    type: "name",
    description: "Phosphoramidate prodrug with chiral phosphorus."
  }
];

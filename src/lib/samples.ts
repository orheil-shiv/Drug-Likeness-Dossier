export interface SampleMolecule {
  name: string;
  category: string;
  smiles: string;
  description: string;
}

export const SAMPLE_MOLECULES: SampleMolecule[] = [
  {
    name: "Aspirin",
    category: "NSAID / Analgesic",
    smiles: "CC(=O)Oc1ccccc1C(=O)O",
    description: "Classic anti-inflammatory acetylsalicylic acid. 0 Lipinski violations."
  },
  {
    name: "Caffeine",
    category: "CNS Stimulant",
    smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
    description: "Methylxanthine alkaloid. Ideal oral bioavailability."
  },
  {
    name: "Ibuprofen",
    category: "NSAID",
    smiles: "CC(C)Cc1ccc(cc1)C(C)C(=O)O",
    description: "Non-steroidal anti-inflammatory with chiral center."
  },
  {
    name: "Paracetamol",
    category: "Analgesic",
    smiles: "CC(=O)Nc1ccc(O)cc1",
    description: "Acetaminophen. Widely used pain and fever medication."
  },
  {
    name: "Penicillin V",
    category: "Beta-Lactam Antibiotic",
    smiles: "CC1(C)S[C@@H]2[C@H](NC(=O)COc3ccccc3)C(=O)N2[C@H]1C(=O)O",
    description: "Phenoxymethylpenicillin with fused beta-lactam thiazolidine core."
  },
  {
    name: "Atorvastatin",
    category: "Statin / HMG-CoA",
    smiles: "CC(C)c1c(C(=O)Nc2ccccc2)c(-c2ccccc2)c(-c2ccc(F)cc2)n1CC[C@@H](O)C[C@@H](O)CC(=O)O",
    description: "Lipid-lowering agent. Lipinski rule boundary test compound (MW 558)."
  },
  {
    name: "Remdesivir",
    category: "Antiviral",
    smiles: "CCC(CC)COC(=O)[C@H](C)N[P@](=O)(OC[C@H]1O[C@](C#N)(c2ccc3n2ncnc3N)[C@H](O)[C@@H]1O)Oc1ccccc1",
    description: "Broad-spectrum antiviral pro-drug with chiral phosphorus center."
  }
];

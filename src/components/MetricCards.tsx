'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Copy, Check, Info } from 'lucide-react';
import { PropertiesData, Metadata } from '@/types/chem';

interface MetricCardsProps {
  properties: PropertiesData;
  metadata: Metadata;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ properties, metadata }) => {
  const [copied, setCopied] = useState(false);
  const [showExtended, setShowExtended] = useState(false);

  const { lipinski, veber, extended, lipinski_violations, veber_violations, drug_likeness_class, drug_likeness_status } = properties;

  const copySmiles = () => {
    if (metadata.smiles) {
      navigator.clipboard.writeText(metadata.smiles);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />
        };
      default:
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          icon: <XCircle className="w-5 h-5 text-rose-400" />
        };
    }
  };

  const statusConfig = getStatusColor(drug_likeness_status);

  const metricsList = [
    { key: 'mw', data: lipinski.mw, rule: 'Lipinski', desc: 'Size limit for passive gut permeability' },
    { key: 'logp', data: lipinski.logp, rule: 'Lipinski', desc: 'Octanol-water partition coefficient' },
    { key: 'hbd', data: lipinski.hbd, rule: 'Lipinski', desc: 'Sum of OH and NH groups' },
    { key: 'hba', data: lipinski.hba, rule: 'Lipinski', desc: 'Sum of O and N atoms' },
    { key: 'tpsa', data: veber.tpsa, rule: 'Veber', desc: 'Polar surface area for cell membrane crossing' },
    { key: 'rotb', data: veber.rotb, rule: 'Veber', desc: 'Conformational flexibility score' }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner Verdict */}
      <div className={`p-4 rounded-xl border ${statusConfig.bg} backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg transition-all`}>
        <div className="flex items-center gap-3">
          {statusConfig.icon}
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{metadata.name || 'Target Molecule'}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusConfig.badge}`}>
                {drug_likeness_status === 'Pass' ? 'Highly Drug-Like' : drug_likeness_status === 'Moderate' ? '1 Alert' : 'Violations'}
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">{drug_likeness_class}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400">Lipinski Ro5 Violations: </span>
            <span className={`font-bold ${lipinski_violations === 0 ? 'text-emerald-400' : lipinski_violations === 1 ? 'text-amber-400' : 'text-rose-400'}`}>
              {lipinski_violations} / 4
            </span>
          </div>
          <div className="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400">Veber Violations: </span>
            <span className={`font-bold ${veber_violations === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {veber_violations} / 2
            </span>
          </div>
        </div>
      </div>

      {/* 6 Key Descriptor Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricsList.map(({ key, data, rule, desc }) => (
          <div
            key={key}
            className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-md group"
            title={desc}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{data.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  data.passed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {data.passed ? 'PASS' : 'ALERT'}
              </span>
            </div>
            <div className="my-2">
              <div className="text-xl font-extrabold text-slate-100 flex items-baseline gap-1">
                <span>{data.value}</span>
                {data.unit && <span className="text-[10px] text-slate-400 font-normal">{data.unit}</span>}
              </div>
              <div className="text-[11px] text-slate-500">
                Rule limit: ≤ {data.limit} {data.unit}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-center justify-between">
              <span>{rule} rule</span>
              <Info className="w-2.5 h-2.5 text-slate-500 group-hover:text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Metadata & Extended Descriptors Drawer */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setShowExtended(!showExtended)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-slate-300 hover:bg-slate-800/50 transition-colors font-medium"
        >
          <span className="flex items-center gap-2">
            <span>Structural Properties & Chemical Identifiers</span>
            {metadata.formula && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-mono text-[11px]">
                {metadata.formula}
              </span>
            )}
          </span>
          {showExtended ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showExtended && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">PubChem CID</div>
                <div className="font-semibold text-slate-200 mt-0.5 font-mono">
                  {metadata.cid ? (
                    <a
                      href={`https://pubchem.ncbi.nlm.nih.gov/compound/${metadata.cid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-400 hover:underline"
                    >
                      {metadata.cid} ↗
                    </a>
                  ) : (
                    'Not Cataloged'
                  )}
                </div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Heavy Atom Count</div>
                <div className="font-semibold text-slate-200 mt-0.5">{extended.heavy_atoms}</div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Stereocenters (Chiral)</div>
                <div className="font-semibold text-slate-200 mt-0.5">
                  {extended.chiral_centers_count} {extended.chiral_centers_count === 0 ? '(Achiral)' : 'centers'}
                </div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Fraction Csp3 (fsp3)</div>
                <div className="font-semibold text-slate-200 mt-0.5">{extended.fsp3}</div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Total Rings</div>
                <div className="font-semibold text-slate-200 mt-0.5">{extended.rings}</div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Aromatic Rings</div>
                <div className="font-semibold text-slate-200 mt-0.5">{extended.aromatic_rings}</div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Molar Refractivity</div>
                <div className="font-semibold text-slate-200 mt-0.5">{extended.molar_refractivity} m³/mol</div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Input Method</div>
                <div className="font-semibold text-slate-200 mt-0.5 capitalize">{metadata.input_type}</div>
              </div>
            </div>

            {metadata.iupac_name && (
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">IUPAC Nomenclature</div>
                <div className="font-medium text-slate-300 text-[11px] mt-0.5 break-words font-mono">
                  {metadata.iupac_name}
                </div>
              </div>
            )}

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-slate-400 text-[11px]">Canonical SMILES</div>
                <div className="font-mono text-slate-300 text-[11px] truncate mt-0.5">
                  {metadata.smiles}
                </div>
              </div>
              <button
                type="button"
                onClick={copySmiles}
                className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

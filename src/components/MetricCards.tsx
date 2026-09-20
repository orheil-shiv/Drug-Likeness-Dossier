'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Info,
  Shield,
  Tag,
  Hash,
  Binary,
  Layers,
  Sparkles
} from 'lucide-react';
import { PropertiesData, Metadata } from '@/types/chem';

interface MetricCardsProps {
  properties: PropertiesData;
  metadata: Metadata;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ properties, metadata }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showExtended, setShowExtended] = useState(false);

  const {
    lipinski,
    veber,
    ghose,
    extended,
    lipinski_violations,
    veber_violations,
    ghose_violations,
    drug_likeness_class,
    drug_likeness_status,
  } = properties;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Pass':
        return {
          cardBg: 'bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        };
      case 'Moderate':
        return {
          cardBg: 'bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200',
          badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
        };
      default:
        return {
          cardBg: 'bg-rose-50/80 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-200',
          badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700',
          icon: <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
        };
    }
  };

  const statusConfig = getStatusConfig(drug_likeness_status);

  return (
    <div className="space-y-4">
      {/* Top Banner Verdict */}
      <div
        className={`p-4 rounded-xl border ${statusConfig.cardBg} backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs transition-all`}
      >
        <div className="flex items-center gap-3">
          {statusConfig.icon}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {metadata.name || 'Target Molecule'}
              </h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${statusConfig.badge}`}
              >
                {drug_likeness_status === 'Pass'
                  ? 'Highly Drug-Like'
                  : drug_likeness_status === 'Moderate'
                  ? 'Acceptable (1 Alert)'
                  : 'Low Drug-Likeness'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {drug_likeness_class} • Formula: <b className="font-mono">{metadata.formula}</b>
            </p>
          </div>
        </div>

        {/* Violations Counter Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400">Lipinski: </span>
            <span
              className={
                lipinski_violations === 0
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-amber-600 dark:text-amber-400 font-bold'
              }
            >
              {lipinski_violations} Violations
            </span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400">Veber: </span>
            <span
              className={
                veber_violations === 0
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-rose-600 dark:text-rose-400 font-bold'
              }
            >
              {veber_violations} Violations
            </span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400">Ghose: </span>
            <span
              className={
                ghose_violations === 0
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-rose-600 dark:text-rose-400 font-bold'
              }
            >
              {ghose_violations} Alerts
            </span>
          </div>
        </div>
      </div>

      {/* Identifiers Card (CAS, PubChem CID, SMILES, InChIKey) */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* CAS Number */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              CAS Registry No.
            </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {metadata.cas || 'Not assigned'}
            </span>
          </div>
          {metadata.cas && (
            <button
              type="button"
              onClick={() => copyText(metadata.cas!, 'cas')}
              title="Copy CAS"
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              {copiedKey === 'cas' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* PubChem CID */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              PubChem CID
            </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {metadata.cid || 'N/A (Custom)'}
            </span>
          </div>
          {metadata.cid && (
            <a
              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${metadata.cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
            >
              View ↗
            </a>
          )}
        </div>

        {/* InChIKey */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
          <div className="truncate mr-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              InChIKey
            </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {metadata.inchikey || 'N/A'}
            </span>
          </div>
          {metadata.inchikey && (
            <button
              type="button"
              onClick={() => copyText(metadata.inchikey!, 'inchikey')}
              title="Copy InChIKey"
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0"
            >
              {copiedKey === 'inchikey' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Canonical SMILES */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
          <div className="truncate mr-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Canonical SMILES
            </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {metadata.smiles}
            </span>
          </div>
          <button
            type="button"
            onClick={() => copyText(metadata.smiles, 'smiles')}
            title="Copy SMILES"
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0"
          >
            {copiedKey === 'smiles' ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Core Rules Grid: Lipinski (4) + Veber (2) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* MW */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Molecular Weight</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                lipinski.mw.passed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {lipinski.mw.passed ? 'PASS' : 'ALERT'}
            </span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {lipinski.mw.value}{' '}
            <span className="text-[11px] font-normal text-slate-400">g/mol</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Limit: ≤ {lipinski.mw.limit} g/mol
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                lipinski.mw.passed ? 'bg-teal-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min((lipinski.mw.value / 500) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* LogP */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">MolLogP</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                lipinski.logp.passed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {lipinski.logp.passed ? 'PASS' : 'ALERT'}
            </span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {lipinski.logp.value}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Limit: ≤ {lipinski.logp.limit}
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                lipinski.logp.passed ? 'bg-teal-500' : 'bg-rose-500'
              }`}
              style={{
                width: `${Math.max(Math.min((lipinski.logp.value / 5) * 100, 100), 5)}%`,
              }}
            />
          </div>
        </div>

        {/* HBD */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">H-Donors (HBD)</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                lipinski.hbd.passed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {lipinski.hbd.passed ? 'PASS' : 'ALERT'}
            </span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {lipinski.hbd.value}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Limit: ≤ {lipinski.hbd.limit}
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                lipinski.hbd.passed ? 'bg-teal-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min((lipinski.hbd.value / 5) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* HBA */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">H-Acceptors (HBA)</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                lipinski.hba.passed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {lipinski.hba.passed ? 'PASS' : 'ALERT'}
            </span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {lipinski.hba.value}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Limit: ≤ {lipinski.hba.limit}
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                lipinski.hba.passed ? 'bg-teal-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min((lipinski.hba.value / 10) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* RotB (Veber) */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Rotatable Bonds</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                veber.rotb.passed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {veber.rotb.passed ? 'PASS' : 'ALERT'}
            </span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {veber.rotb.value}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Limit: ≤ {veber.rotb.limit}
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                veber.rotb.passed ? 'bg-teal-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min((veber.rotb.value / 10) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* TPSA (Veber) */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">TPSA Area</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                veber.tpsa.passed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {veber.tpsa.passed ? 'PASS' : 'ALERT'}
            </span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {veber.tpsa.value}{' '}
            <span className="text-[11px] font-normal text-slate-400">Å²</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Limit: ≤ {veber.tpsa.limit} Å²
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                veber.tpsa.passed ? 'bg-teal-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min((veber.tpsa.value / 140) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ghose Filter & Extended Descriptors Toggle Accordion */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setShowExtended(!showExtended)}
          className="w-full px-4 py-2.5 bg-slate-50/70 hover:bg-slate-100/80 dark:bg-slate-950/40 dark:hover:bg-slate-950/80 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Ghose Drug-Likeness Filter & Extended Molecular Topology</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span className="text-[11px]">{showExtended ? 'Hide Details' : 'Show Details'}</span>
            {showExtended ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showExtended && (
          <div className="p-4 space-y-4 border-t border-slate-100 dark:border-slate-800 text-xs animate-in fade-in">
            {/* Ghose Filter Matrix */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Ghose Filter Boundaries
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Ghose LogP</span>
                    <span
                      className={`text-[9px] font-bold px-1 rounded ${
                        ghose.logp.passed
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {ghose.logp.passed ? 'PASS' : 'ALERT'}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                    {ghose.logp.value}
                  </div>
                  <div className="text-[10px] text-slate-400">Limit: {ghose.logp.limit}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Ghose MW</span>
                    <span
                      className={`text-[9px] font-bold px-1 rounded ${
                        ghose.mw.passed
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {ghose.mw.passed ? 'PASS' : 'ALERT'}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                    {ghose.mw.value} g/mol
                  </div>
                  <div className="text-[10px] text-slate-400">Limit: {ghose.mw.limit} g/mol</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Molar Refractivity</span>
                    <span
                      className={`text-[9px] font-bold px-1 rounded ${
                        ghose.mr.passed
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {ghose.mr.passed ? 'PASS' : 'ALERT'}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                    {ghose.mr.value}
                  </div>
                  <div className="text-[10px] text-slate-400">Limit: {ghose.mr.limit}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Heavy Atoms</span>
                    <span
                      className={`text-[9px] font-bold px-1 rounded ${
                        ghose.atoms.passed
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {ghose.atoms.passed ? 'PASS' : 'ALERT'}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                    {ghose.atoms.value}
                  </div>
                  <div className="text-[10px] text-slate-400">Limit: {ghose.atoms.limit}</div>
                </div>
              </div>
            </div>

            {/* Extended Topology */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Extended Structural Parameters
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Fraction Csp3</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {extended.fsp3}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Total Rings</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {extended.rings}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Aromatic Rings</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {extended.aromatic_rings}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Heavy Atoms</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {extended.heavy_atoms}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Molar Refractivity</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {extended.molar_refractivity}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Chiral Centers</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {extended.chiral_centers_count}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

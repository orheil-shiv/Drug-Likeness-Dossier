'use client';

import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Activity, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { SafetyData } from '@/types/chem';

interface SafetyPictogramsProps {
  safety?: SafetyData;
  compoundName: string;
}

export const SafetyPictograms: React.FC<SafetyPictogramsProps> = ({ safety, compoundName }) => {
  const [showAllStatements, setShowAllStatements] = useState(false);

  const pictograms = safety?.pictograms || [];
  const hazardStatements = safety?.hazard_statements || [];
  const bioassaysCount = safety?.bioassays_count || 0;
  const activeBioassaysCount = safety?.active_bioassays_count || 0;

  return (
    <div className="rounded-xl glass-panel p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3.5 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Safety & PubChem Bioassays
          </h4>
        </div>
        <span className="text-[10px] font-semibold text-slate-400">GHS Classification</span>
      </div>

      {/* GHS Pictograms Row */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Hazard Pictograms
        </span>
        {pictograms.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {pictograms.map((pic) => (
              <div
                key={pic.code}
                title={`${pic.code}: ${pic.name}`}
                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs transition-all hover:scale-105"
              >
                <img
                  src={pic.url}
                  alt={pic.name}
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    // fallback if SVG fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-[10px] font-bold text-amber-900 dark:text-amber-200">
                  {pic.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>No critical GHS pictograms flagged on PubChem record.</span>
          </div>
        )}
      </div>

      {/* Bioassay Activity Statistics */}
      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Tested PubChem Bioassays</span>
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
            {bioassaysCount.toLocaleString()}
          </span>
        </div>

        {bioassaysCount > 0 && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Reported Active Assays:</span>
            <span className="font-mono font-semibold text-teal-600 dark:text-teal-400">
              {activeBioassaysCount} ({((activeBioassaysCount / bioassaysCount) * 100).toFixed(1)}%)
            </span>
          </div>
        )}
      </div>

      {/* Hazard Statements preview */}
      {hazardStatements.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>Hazard Statements</span>
            {hazardStatements.length > 2 && (
              <button
                type="button"
                onClick={() => setShowAllStatements(!showAllStatements)}
                className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5 lowercase"
              >
                {showAllStatements ? 'show less' : `+${hazardStatements.length - 2} more`}
              </button>
            )}
          </div>

          <div className="space-y-1 max-h-24 overflow-y-auto">
            {(showAllStatements ? hazardStatements : hazardStatements.slice(0, 2)).map((stmt, i) => (
              <div
                key={i}
                className="p-1.5 rounded bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-600 dark:text-slate-300 flex items-start gap-1.5"
              >
                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{stmt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

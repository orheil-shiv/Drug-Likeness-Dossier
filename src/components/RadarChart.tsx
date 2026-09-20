'use client';

import React from 'react';
import { Download, Radar, HelpCircle } from 'lucide-react';

interface RadarChartProps {
  radarB64: string;
  compoundName: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({ radarB64, compoundName }) => {
  const downloadChart = () => {
    if (!radarB64) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${radarB64}`;
    link.download = `${compoundName.replace(/\s+/g, '_')}_Lipinski_Radar.png`;
    link.click();
  };

  return (
    <div className="rounded-xl glass-panel flex flex-col h-full shadow-2xs overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Oral Bioavailability Radar
          </h4>
        </div>
        <button
          type="button"
          onClick={downloadChart}
          disabled={!radarB64}
          title="Download Radar Chart PNG"
          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-950/40">
        {radarB64 ? (
          <div className="relative group max-w-[280px] max-h-[280px] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${radarB64}`}
              alt={`${compoundName} Lipinski Radar Plot`}
              className="max-h-[260px] w-auto object-contain filter drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="text-center p-4 text-slate-400 text-xs">
            Chart generation pending...
          </div>
        )}

        {/* Legend Footnote */}
        <div className="w-full mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/70 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-red-500" />
              <span>Boundary Limit (1.0x)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-teal-500/30 border border-teal-500" />
              <span>Target Profile</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            Normalized scale: points inside the red polygon conform to Lipinski/Veber criteria.
          </p>
        </div>
      </div>
    </div>
  );
};

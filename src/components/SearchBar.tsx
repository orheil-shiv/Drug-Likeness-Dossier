'use client';

import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Loader2, Database, Tag, Hash, FileCode2, Binary } from 'lucide-react';
import { SAMPLE_MOLECULES, SampleMolecule } from '@/lib/samples';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  currentQuery: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, currentQuery }) => {
  const [query, setQuery] = useState(currentQuery);

  // Detect input type in real time
  const detectedType = useMemo(() => {
    const q = query.trim();
    if (!q) return null;
    if (/^\d{2,7}-\d{2}-\d$/.test(q)) return { label: 'CAS Registry No.', icon: <Tag className="w-3 h-3 text-amber-500" />, color: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800' };
    if (/^\d+$/.test(q)) return { label: 'PubChem CID', icon: <Hash className="w-3 h-3 text-blue-500" />, color: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-800' };
    if (q.startsWith('InChI=')) return { label: 'InChI Identifier', icon: <Binary className="w-3 h-3 text-purple-500" />, color: 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950/40 dark:border-purple-800' };
    if (/[()=\#\[\]\\\/]/.test(q) || /^[A-Z][a-z]?(\d+)?$/.test(q)) return { label: 'SMILES String', icon: <FileCode2 className="w-3 h-3 text-teal-500" />, color: 'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-300 dark:bg-teal-950/40 dark:border-teal-800' };
    return { label: 'Compound / IUPAC Name', icon: <Database className="w-3 h-3 text-emerald-500" />, color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800' };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSelectSample = (sample: SampleMolecule) => {
    setQuery(sample.query);
    onSearch(sample.query);
  };

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Compound Name (Aspirin), CAS (50-78-2), PubChem CID (2244), SMILES, or InChI..."
            disabled={isLoading}
            className="w-full pl-10 pr-36 py-3 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 shadow-sm transition-all disabled:opacity-60 font-mono text-xs sm:text-sm"
          />

          {/* Real-time Detected Mode Badge */}
          {detectedType && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border shadow-xs transition-all pointer-events-none">
              <span className={`flex items-center gap-1 ${detectedType.color} px-1.5 py-0.5 rounded border`}>
                {detectedType.icon}
                <span>{detectedType.label}</span>
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Resolving...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze & Render</span>
            </>
          )}
        </button>
      </form>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar pt-1">
        <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap flex items-center gap-1 mr-1">
          <Database className="w-3 h-3 text-teal-600 dark:text-teal-400" /> Presets:
        </span>
        {SAMPLE_MOLECULES.map((sample) => (
          <button
            key={sample.name}
            type="button"
            onClick={() => handleSelectSample(sample)}
            disabled={isLoading}
            title={`${sample.category}: ${sample.description}`}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 transition-all whitespace-nowrap flex items-center gap-1.5 shadow-2xs font-medium text-[11px]"
          >
            <span>{sample.name}</span>
            <span className="text-[10px] text-slate-400 font-normal">({sample.category})</span>
          </button>
        ))}
      </div>
    </div>
  );
};

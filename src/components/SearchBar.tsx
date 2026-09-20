'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { SAMPLE_MOLECULES, SampleMolecule } from '@/lib/samples';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  currentQuery: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, currentQuery }) => {
  const [query, setQuery] = useState(currentQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSelectSample = (sample: SampleMolecule) => {
    setQuery(sample.name);
    onSearch(sample.name);
  };

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter compound name (e.g. Aspirin, Atorvastatin) or SMILES string (e.g. CC(=O)Oc1ccccc1C(=O)O)..."
            disabled={isLoading}
            className="w-full pl-11 pr-28 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 shadow-inner transition-all disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Profile Mol</span>
            </>
          )}
        </button>
      </form>

      {/* Preset candidate drug chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-400" /> Presets:
        </span>
        {SAMPLE_MOLECULES.map((sample) => (
          <button
            key={sample.name}
            type="button"
            onClick={() => handleSelectSample(sample)}
            disabled={isLoading}
            title={`${sample.category}: ${sample.description}`}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            <span className="font-medium">{sample.name}</span>
            <span className="text-[10px] text-slate-400">({sample.category.split(' ')[0]})</span>
          </button>
        ))}
      </div>
    </div>
  );
};

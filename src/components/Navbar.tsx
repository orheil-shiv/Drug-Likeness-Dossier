'use client';

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Sun,
  Moon,
  Dna,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { DossierExport } from './DossierExport';
import { AnalysisResult } from '@/types/chem';

interface NavbarProps {
  analysisData: AnalysisResult | null;
  onSelectPreset: (compound: string) => void;
  currentQuery: string;
}

const PRESET_COMPOUNDS = [
  { name: 'Aspirin', desc: 'Analgesic (MW 180.16)', query: 'Aspirin' },
  { name: 'Caffeine', desc: 'CNS Stimulant (MW 194.19)', query: 'Caffeine' },
  { name: 'Ibuprofen', desc: 'NSAID (MW 206.28)', query: 'Ibuprofen' },
  { name: 'Paracetamol', desc: 'Antipyretic (MW 151.16)', query: 'Paracetamol' },
  { name: 'Penicillin V', desc: 'Beta-lactam (MW 350.39)', query: 'Penicillin V' },
  { name: 'Atorvastatin', desc: 'Statin (MW 558.64)', query: 'Atorvastatin' },
  { name: 'Remdesivir', desc: 'Antiviral (MW 602.58)', query: 'Remdesivir' },
  { name: 'Metformin', desc: 'Antidiabetic (MW 129.16)', query: 'Metformin' },
];

export const Navbar: React.FC<NavbarProps> = ({
  analysisData,
  onSelectPreset,
  currentQuery,
}) => {
  const [isDark, setIsDark] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);

  useEffect(() => {
    // Check initial user preference or default to light
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Branding & Lab Telemetry */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-teal-600 to-sky-600 flex items-center justify-center shadow-md shadow-teal-500/20 text-white">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Cheminformatics Virtual Lab
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                VIRTUAL BENCH 01
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>Molecular Profiling & 3D Conformation Station</span>
              <span className="hidden lg:inline text-slate-300 dark:text-slate-700">•</span>
              <span className="hidden lg:inline text-[11px] text-teal-600 dark:text-teal-400 font-mono">
                RDKit • 3Dmol.js • ReportLab
              </span>
            </p>
          </div>
        </div>

        {/* Right: Presets, Export, and Theme Switcher */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Preset Compounds Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPresetOpen(!presetOpen)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Dna className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Reference Drugs</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${presetOpen ? 'rotate-180' : ''}`} />
            </button>

            {presetOpen && (
              <div className="absolute right-0 mt-1.5 w-60 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  Select Benchmark Compound
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {PRESET_COMPOUNDS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        onSelectPreset(c.query);
                        setPresetOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-teal-50 dark:hover:bg-slate-700/60 flex flex-col transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {c.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dossier PDF Download */}
          {analysisData && <DossierExport analysisData={analysisData} />}

          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Virtual Lab Light Mode' : 'Switch to Dark Chamber Mode'}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
